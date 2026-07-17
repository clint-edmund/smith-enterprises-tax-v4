import {
  ReportCard,
} from "@/features/reports/components/report-card"
import type {
  ReportCategoryDefinition,
  ReportDefinition,
} from "@/features/reports/types/report.types"

interface ReportCategorySectionProps {
  category: ReportCategoryDefinition
  reports: ReportDefinition[]
}

export function ReportCategorySection({
  category,
  reports,
}: ReportCategorySectionProps) {
  if (reports.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold text-slate-950">
          {category.title}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {category.description}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
          />
        ))}
      </div>
    </section>
  )
}
