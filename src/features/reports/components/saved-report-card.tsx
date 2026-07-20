import {
  CalendarClock,
  ExternalLink,
  Star,
} from "lucide-react"
import { Link } from "react-router-dom"

import type {
  ReportDefinition,
  SavedReportPreference,
} from "@/features/reports/types/report.types"

interface SavedReportCardProps {
  report: ReportDefinition
  preference?: SavedReportPreference
  onToggleFavorite: (reportId: string) => void
  onSchedule: (report: ReportDefinition) => void
}

function describeSchedule(preference?: SavedReportPreference) {
  const schedule = preference?.schedule

  if (!schedule) {
    return "Not scheduled"
  }

  const time = new Date(2026, 0, 1, schedule.hour).toLocaleTimeString([], {
    hour: "numeric",
  })

  if (schedule.cadence === "daily") {
    return `Daily at ${time}`
  }

  if (schedule.cadence === "weekly") {
    const day = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][schedule.dayOfWeek ?? 1]

    return `${day} at ${time}`
  }

  return `Monthly on day ${schedule.dayOfMonth ?? 1} at ${time}`
}

export function SavedReportCard({
  report,
  preference,
  onToggleFavorite,
  onSchedule,
}: SavedReportCardProps) {
  const Icon = report.icon

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
            <Icon className="size-5" />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              {report.title}
            </h3>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {report.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={
            preference?.isFavorite
              ? `Remove ${report.title} from favorites`
              : `Add ${report.title} to favorites`
          }
          onClick={() => onToggleFavorite(report.id)}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
        >
          <Star
            className={`size-4 ${
              preference?.isFavorite ? "fill-current text-amber-500" : ""
            }`}
          />
        </button>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
        {describeSchedule(preference)}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={report.href}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <ExternalLink className="size-4" />
          Run Report
        </Link>

        <button
          type="button"
          onClick={() => onSchedule(report)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <CalendarClock className="size-4" />
          Schedule
        </button>
      </div>
    </article>
  )
}
