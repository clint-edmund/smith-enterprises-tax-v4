import { Search, Star } from "lucide-react"
import {
  useMemo,
  useState,
} from "react"

import { ReportCategorySection } from "@/features/reports/components/report-category-section"
import { ReportScheduleDialog } from "@/features/reports/components/report-schedule-dialog"
import { SavedReportCard } from "@/features/reports/components/saved-report-card"
import {
  reportCategories,
  reports,
} from "@/features/reports/data/report-catalog"
import {
  getReportPreferences,
  removeReportSchedule,
  saveReportSchedule,
  toggleFavoriteReport,
} from "@/features/reports/services/report-preferences-service"
import type {
  ReportDefinition,
  ReportScheduleCadence,
  SavedReportPreference,
} from "@/features/reports/types/report.types"

export function ReportsPage() {
  const [searchValue, setSearchValue] = useState("")
  const [preferences, setPreferences] =
    useState<SavedReportPreference[]>(getReportPreferences)
  const [scheduledReport, setScheduledReport] =
    useState<ReportDefinition | null>(null)

  const normalizedSearch = searchValue.trim().toLowerCase()

  const filteredReports = useMemo(() => {
    if (!normalizedSearch) {
      return reports
    }

    return reports.filter((report) =>
      `${report.title} ${report.description}`
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [normalizedSearch])

  const favoriteReports = reports.filter((report) =>
    preferences.some(
      (preference) =>
        preference.reportId === report.id && preference.isFavorite,
    ),
  )

  const getPreference = (reportId: string) =>
    preferences.find(
      (preference) => preference.reportId === reportId,
    )

  const handleToggleFavorite = (reportId: string) => {
    setPreferences(toggleFavoriteReport(reportId))
  }

  const handleSaveSchedule = (
    reportId: string,
    schedule: {
      cadence: ReportScheduleCadence
      dayOfWeek?: number
      dayOfMonth?: number
      hour: number
    },
  ) => {
    setPreferences(saveReportSchedule(reportId, schedule))
  }

  const handleRemoveSchedule = (reportId: string) => {
    setPreferences(removeReportSchedule(reportId))
  }

  return (
    <section className="space-y-8">
      <header className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
          Reporting Center
        </p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Reports
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Launch live reports, save favorites, and store schedule preferences for frequently used office views.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <label htmlFor="report-search" className="sr-only">
              Search reports
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="report-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search reports"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <Star className="size-5 fill-current text-amber-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Saved Reports
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Favorites also appear in the Dashboard Quick Reports panel.
            </p>
          </div>
        </div>

        {favoriteReports.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            No saved reports yet. Use the star button on a report below to add it here.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {favoriteReports.map((report) => (
              <SavedReportCard
                key={report.id}
                report={report}
                preference={getPreference(report.id)}
                onToggleFavorite={handleToggleFavorite}
                onSchedule={setScheduledReport}
              />
            ))}
          </div>
        )}
      </section>

      {filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <Search className="mx-auto size-8 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No reports found
          </h2>
          <button
            type="button"
            onClick={() => setSearchValue("")}
            className="mt-5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-9">
          {reportCategories.map((category) => (
            <ReportCategorySection
              key={category.id}
              category={category}
              reports={filteredReports.filter(
                (report) => report.category === category.id,
              )}
              preferences={preferences}
              onToggleFavorite={handleToggleFavorite}
              onSchedule={setScheduledReport}
            />
          ))}
        </div>
      )}

      <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950">
        <p className="font-semibold">Scheduling note</p>
        <p className="mt-1 leading-6">
          Sprint 3 stores report favorites and schedule preferences in this browser. It does not yet send reports automatically; server-side delivery will require a later Supabase Edge Function or scheduled job.
        </p>
      </aside>

      <ReportScheduleDialog
        report={scheduledReport}
        preference={
          scheduledReport
            ? getPreference(scheduledReport.id)
            : undefined
        }
        onClose={() => setScheduledReport(null)}
        onSave={handleSaveSchedule}
        onRemove={handleRemoveSchedule}
      />
    </section>
  )
}
