import type {
  ReactNode,
} from "react"

interface OrganizerSummaryMetric {
  key: string

  label: string

  value: ReactNode

  description?: string
}

interface OrganizerSummaryDashboardProps {
  title: string

  description?: string

  metrics:
    readonly OrganizerSummaryMetric[]

  progressPercentage?: number

  progressLabel?: string
}

export function OrganizerSummaryDashboard({
  title,
  description,
  metrics,
  progressPercentage,
  progressLabel = "Completion",
}: OrganizerSummaryDashboardProps) {
  const normalizedProgress =
    progressPercentage === undefined
      ? null
      : Math.min(
          100,
          Math.max(
            0,
            progressPercentage,
          ),
        )

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        )}
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(
          (metric) => (
            <div
              key={metric.key}
              className="bg-white p-6"
            >
              <p className="text-sm font-medium text-slate-600">
                {metric.label}
              </p>

              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {metric.value}
              </div>

              {metric.description && (
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {metric.description}
                </p>
              )}
            </div>
          ),
        )}
      </div>

      {normalizedProgress !== null && (
        <div className="border-t border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-700">
              {progressLabel}
            </p>

            <p className="text-sm font-semibold text-slate-950">
              {Math.round(
                normalizedProgress,
              )}
              %
            </p>
          </div>

          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label={
              progressLabel
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              Math.round(
                normalizedProgress,
              )
            }
          >
            <div
              className="h-full rounded-full bg-blue-700 transition-[width]"
              style={{
                width:
                  `${normalizedProgress}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}