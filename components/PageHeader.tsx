export function PageHeader({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 border-b hairline pb-6">
      <div className="kicker mb-2">{kicker}</div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-smoke">
              {subtitle}
            </p>
          )}
        </div>
        {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
      </div>
    </header>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-md border hairline bg-pearl/50 p-10 text-center">
      <div className="font-display text-xl">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm text-smoke">{hint}</p>
    </div>
  );
}
