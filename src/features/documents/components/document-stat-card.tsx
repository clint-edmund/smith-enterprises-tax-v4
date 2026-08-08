import type { ReactNode } from "react";

interface DocumentStatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  description?: string;
}

export function DocumentStatCard({
  label,
  value,
  icon,
  description,
}: DocumentStatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">{value}</h3>

          {description ? (
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">{icon}</div>
      </div>
    </article>
  );
}
