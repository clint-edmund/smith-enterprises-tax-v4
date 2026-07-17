import type {
  ReportCategoryDefinition,
  ReportDefinition,
  SavedReportPreference,
} from "@/features/reports/types/report.types"
import { SavedReportCard } from "@/features/reports/components/saved-report-card"

interface ReportCategorySectionProps {
  category: ReportCategoryDefinition
  reports: ReportDefinition[]
  preferences: SavedReportPreference[]
  onToggleFavorite: (reportId: string) => void
  onSchedule: (report: ReportDefinition) => void
}

export function ReportCategorySection({
  category,
  reports,
  preferences,
  onToggleFavorite,
  onSchedule,
}: ReportCategorySectionProps) {
  if (reports.length === 0) {
    return null
  }

  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          {category.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {category.description}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <SavedReportCard
            key={report.id}
            report={report}
            preference={preferences.find(
              (preference) => preference.reportId === report.id,
            )}
            onToggleFavorite={onToggleFavorite}
            onSchedule={onSchedule}
          />
        ))}
      </div>
    </section>
  )
}
