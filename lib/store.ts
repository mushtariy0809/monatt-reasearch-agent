// Storage layer.
//
// Two interchangeable drivers behind one interface:
//  - SupabaseDriver — used automatically when SUPABASE_URL and
//    SUPABASE_SERVICE_ROLE_KEY are set (schema in supabase/schema.sql).
//  - FileDriver — zero-setup local JSON file (.data/db.json) so the app
//    works before any account exists.
//
// Server-side only. Never import from client components.

import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Collection =
  | "signals"
  | "trends"
  | "phrases"
  | "price_points"
  | "cultural_moments"
  | "predictions"
  | "product_ideas"
  | "saved_items"
  | "briefs"
  | "gtrends_points";

export const PRIMARY_KEY: Record<Collection, string> = {
  signals: "id",
  trends: "slug",
  phrases: "id",
  price_points: "id",
  cultural_moments: "id",
  predictions: "id",
  product_ideas: "id",
  saved_items: "id",
  briefs: "id",
  gtrends_points: "id",
};

export interface StoreDriver {
  kind: "supabase" | "file";
  all<T>(c: Collection): Promise<T[]>;
  upsert(c: Collection, rows: object[]): Promise<void>;
  replaceAll(c: Collection, rows: object[]): Promise<void>;
  removeByKey(c: Collection, keyValue: string): Promise<void>;
  getMeta<T>(key: string): Promise<T | null>;
  setMeta(key: string, value: unknown): Promise<void>;
}

// ── File driver ───────────────────────────────────────────────────────

interface FileDb {
  collections: Partial<Record<Collection, object[]>>;
  meta: Record<string, unknown>;
}

const DB_PATH = path.join(process.cwd(), ".data", "db.json");
let writeQueue: Promise<void> = Promise.resolve();

async function readDb(): Promise<FileDb> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as FileDb;
  } catch {
    return { collections: {}, meta: {} };
  }
}

async function writeDb(db: FileDb): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db), "utf8");
  await fs.rename(tmp, DB_PATH);
}

/** Serialize mutations through a queue to avoid concurrent-write clobbering. */
function mutate(fn: (db: FileDb) => void): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const db = await readDb();
    fn(db);
    await writeDb(db);
  });
  return writeQueue;
}

const fileDriver: StoreDriver = {
  kind: "file",
  async all<T>(c: Collection): Promise<T[]> {
    const db = await readDb();
    return (db.collections[c] ?? []) as T[];
  },
  async upsert(c, rows) {
    const pk = PRIMARY_KEY[c];
    await mutate((db) => {
      const existing = db.collections[c] ?? [];
      const byKey = new Map(
        existing.map((r) => [(r as Record<string, unknown>)[pk], r]),
      );
      for (const row of rows)
        byKey.set((row as Record<string, unknown>)[pk], row);
      db.collections[c] = [...byKey.values()];
    });
  },
  async replaceAll(c, rows) {
    await mutate((db) => {
      db.collections[c] = rows;
    });
  },
  async removeByKey(c, keyValue) {
    const pk = PRIMARY_KEY[c];
    await mutate((db) => {
      db.collections[c] = (db.collections[c] ?? []).filter(
        (r) => (r as Record<string, unknown>)[pk] !== keyValue,
      );
    });
  },
  async getMeta<T>(key: string): Promise<T | null> {
    const db = await readDb();
    return (db.meta[key] as T) ?? null;
  },
  async setMeta(key, value) {
    await mutate((db) => {
      db.meta[key] = value;
    });
  },
};

// ── Supabase driver ───────────────────────────────────────────────────

function makeSupabaseDriver(client: SupabaseClient): StoreDriver {
  return {
    kind: "supabase",
    async all<T>(c: Collection): Promise<T[]> {
      const { data, error } = await client.from(c).select("*");
      if (error) throw new Error(`Supabase read ${c}: ${error.message}`);
      return (data ?? []) as T[];
    },
    async upsert(c, rows) {
      if (rows.length === 0) return;
      const { error } = await client
        .from(c)
        .upsert(rows, { onConflict: PRIMARY_KEY[c] });
      if (error) throw new Error(`Supabase upsert ${c}: ${error.message}`);
    },
    async replaceAll(c, rows) {
      const pk = PRIMARY_KEY[c];
      const { error: delError } = await client
        .from(c)
        .delete()
        .neq(pk, "__never_matches__");
      if (delError) throw new Error(`Supabase clear ${c}: ${delError.message}`);
      // Insert in chunks to stay under payload limits.
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await client.from(c).insert(rows.slice(i, i + 500));
        if (error) throw new Error(`Supabase insert ${c}: ${error.message}`);
      }
    },
    async removeByKey(c, keyValue) {
      const { error } = await client.from(c).delete().eq(PRIMARY_KEY[c], keyValue);
      if (error) throw new Error(`Supabase delete ${c}: ${error.message}`);
    },
    async getMeta<T>(key: string): Promise<T | null> {
      const { data, error } = await client
        .from("meta")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw new Error(`Supabase meta read: ${error.message}`);
      return (data?.value as T) ?? null;
    },
    async setMeta(key, value) {
      const { error } = await client.from("meta").upsert({ key, value }, { onConflict: "key" });
      if (error) throw new Error(`Supabase meta write: ${error.message}`);
    },
  };
}

// ── Singleton ─────────────────────────────────────────────────────────

let driver: StoreDriver | null = null;

export function getDriver(): StoreDriver {
  if (driver) return driver;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    driver = makeSupabaseDriver(
      createClient(url, key, { auth: { persistSession: false } }),
    );
  } else {
    driver = fileDriver;
  }
  return driver;
}

export function storageKind(): "supabase" | "file" {
  return getDriver().kind;
}
