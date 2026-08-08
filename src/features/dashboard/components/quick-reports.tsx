import { BarChart3, Star } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { reports } from "@/features/reports/data/report-catalog"
import { getFavoriteReportIds } from "@/features/reports/services/report-preferences-service"

export function QuickReports() {

  const [favoriteIds] =
  useState<string[]>(() => getFavoriteReportIds())

  const favoriteReports = reports
    .filter((report) => favoriteIds.includes(report.id))
    .slice(0, 5)

  return (
    <section className="rounded-2xl border border-brand-200 bg-white p-5 shadow-[0_10px_30px_rgba(33,31,28,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-800">
            Reporting
          </p>
          <h2 className="mt-1 text-xl font-bold text-brand-950">
            Quick Reports
          </h2>
        </div>

        <BarChart3 className="size-6 text-brand-400" />
      </div>

      {favoriteReports.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-5 text-center">
          <Star className="mx-auto size-5 text-brand-400" />
          <p className="mt-2 text-sm text-brand-600">
            Favorite reports from the Report Center to place shortcuts here.
          </p>
          <Link
            to="/reports"
            className="mt-3 inline-flex text-sm font-semibold text-brand-800 hover:text-brand-900"
          >
            Open Report Center
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {favoriteReports.map((report) => (
            <Link
              key={report.id}
              to={report.href}
              className="flex items-center justify-between rounded-xl border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-800 transition hover:border-brand-400 hover:bg-brand-100"
            >
              {report.title}
              <span aria-hidden="true">→</span>
            </Link>
          ))}

          <Link
            to="/reports"
            className="inline-flex pt-2 text-sm font-semibold text-brand-800 hover:text-brand-900"
          >
            Manage saved reports
          </Link>
        </div>
      )}
    </section>
  )
}
