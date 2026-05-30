interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {kicker && (
          <h1 className="text-2xl font-bold uppercase tracking-[0.18em] text-brand-primary">
            {kicker}
          </h1>
        )}
        <p className="mt-1 text-xs font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </p>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
