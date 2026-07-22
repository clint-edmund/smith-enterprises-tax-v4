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
      className={`h-full rounded-2xl border border-brand-200 bg-white p-5 shadow-[0_10px_30px_rgba(33,31,28,0.06)] transition ${
        href
          ? "hover:-translate-y-1 hover:border-brand-400 hover:shadow-[0_16px_36px_rgba(33,31,28,0.10)]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">{label}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-950">
            {value}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-brand-200 bg-brand-100 text-brand-800">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-brand-500">{description}</p>

      {href ? (
        <p className="mt-3 text-xs font-semibold text-brand-800">
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
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
      aria-label={`View ${label.toLowerCase()}`}
    >
      {content}
    </Link>
  );
}
