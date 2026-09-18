"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SECTIONS: { label: string; items: { href: string; name: string }[] }[] = [
  {
    label: "Intelligence",
    items: [
      { href: "/", name: "Overview" },
      { href: "/trends", name: "Live Trends" },
      { href: "/predictions", name: "Predictions" },
    ],
  },
  {
    label: "Culture",
    items: [
      { href: "/culture", name: "Uzbek & Diaspora" },
      { href: "/fashion", name: "Fashion & Streetwear" },
      { href: "/quotes", name: "Quotes & Language" },
      { href: "/celebrities", name: "Celebrities & Creators" },
      { href: "/food", name: "Food & Lifestyle" },
    ],
  },
  {
    label: "Studio",
    items: [
      { href: "/prices", name: "Price Tracker" },
      { href: "/generator", name: "Outfit Generator" },
      { href: "/saved", name: "Saved Ideas" },
    ],
  },
  {
    label: "System",
    items: [{ href: "/sources", name: "Sources & Methodology" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-6">
      {SECTIONS.map((s) => (
        <div key={s.label}>
          <div className="kicker mb-2 !text-[#8a8880]">{s.label}</div>
          <ul className="flex flex-col">
            {s.items.map((i) => {
              const active = pathname === i.href;
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={`block border-l-2 px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-uzblue text-white"
                        : "border-transparent text-[#c9c6bc] hover:text-white"
                    }`}
                  >
                    {i.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="no-print sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Link href="/" className="font-display text-lg text-white">
          Monatt<span className="text-uzblue">.</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          className="text-sm text-[#c9c6bc]"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="no-print bg-ink px-4 pb-6 lg:hidden">{nav}</div>
      )}
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto bg-ink px-5 py-8 lg:flex">
        <Link href="/" className="mb-1 font-display text-2xl text-white">
          Monatt<span className="text-uzblue">.</span>
        </Link>
        <div className="kicker mb-8 !text-[#8a8880]">Trend Intelligence</div>
        {nav}
        <div className="mt-auto pt-8 text-[10px] leading-relaxed text-[#7a7870]">
          Data provenance is labeled on every record: live, cached, sample,
          manual or AI.
        </div>
      </aside>
    </>
  );
}
