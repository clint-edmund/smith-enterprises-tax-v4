import {
  ArrowRight,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import type {
  ReportDefinition,
} from "@/features/reports/types/report.types"

interface ReportCardProps {
  report: ReportDefinition
}

export function ReportCard({
  report,
}: ReportCardProps) {
  const Icon = report.icon

  return (
    <Link
      to={report.href}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-100">
          <Icon className="size-5" />
        </span>

        {report.badge && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {report.badge}
          </span>
        )}
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-lg font-bold text-slate-950">
          {report.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {report.description}
        </p>
      </div>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
        Open report
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
