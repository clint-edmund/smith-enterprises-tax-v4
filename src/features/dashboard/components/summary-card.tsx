import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface SummaryCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

export function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  href,
}: SummaryCardProps) {
  const content = (
    <article
      className={`h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${
        href
          ? "hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p>

      {href ? (
        <p className="mt-3 text-xs font-semibold text-blue-700">
          View matching returns →
        </p>
      ) : null}
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      to={href}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      aria-label={`View ${label.toLowerCase()}`}
    >
      {content}
    </Link>
  );
}
