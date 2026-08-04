import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock3,
  UserRoundCheck,
} from "lucide-react"

interface OrganizerWorkspaceCardProps {
  clientName: string
  taxYear: number
  assignedPreparer:
    string | null
}

const reviewSections = [
  {
    key:
      "income",
    label:
      "Income",
    status:
      "reviewed",
  },
  {
    key:
      "dependents",
    label:
      "Dependents",
    status:
      "reviewed",
  },
  {
    key:
      "deductions",
    label:
      "Deductions",
    status:
      "pending",
  },
  {
    key:
      "credits",
    label:
      "Credits",
    status:
      "pending",
  },
  {
    key:
      "business",
    label:
      "Business",
    status:
      "pending",
  },
] as const

export function OrganizerWorkspaceCard({
  clientName,
  taxYear,
  assignedPreparer,
}: OrganizerWorkspaceCardProps) {
  const reviewedCount =
    reviewSections.filter(
      (section) =>
        section.status ===
        "reviewed",
    ).length

  const reviewPercentage =
    Math.round(
      (
        reviewedCount /
        reviewSections.length
      ) *
        100,
    )

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-950 p-6 text-white sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-100 ring-1 ring-white/20">
              <ClipboardCheck
                className="size-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                Staff Workspace
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Organizer Workspace
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Review {clientName}&apos;s organizer completion, staff review progress, and assigned preparer from one workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            title="Organizer Review navigation will be enabled in the next phase."
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-white/20"
          >
            Open Organizer Review
            <ArrowRight
              className="size-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tax Year
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {taxYear}
          </p>
        </div>

        <div className="bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Organizer Status
          </p>

          <div className="mt-2">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
              Submitted
            </span>
          </div>
        </div>

        <div className="bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Completion
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            100%
          </p>
        </div>

        <div className="bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Last Updated
          </p>

          <div className="mt-2 flex items-center gap-2 font-semibold text-slate-950">
            <Clock3
              className="size-4 text-slate-500"
              aria-hidden="true"
            />
            Placeholder
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] sm:p-7">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Review Progress
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-950">
                {reviewedCount} of {reviewSections.length} sections reviewed
              </h3>
            </div>

            <p className="text-2xl font-bold text-blue-700">
              {reviewPercentage}%
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-700"
              style={{
                width:
                  `${reviewPercentage}%`,
              }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reviewSections.map(
              (section) => {
                const reviewed =
                  section.status ===
                  "reviewed"

                return (
                  <div
                    key={
                      section.key
                    }
                    className={[
                      "flex items-center justify-between gap-3 rounded-xl border p-3",
                      reviewed
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="font-semibold text-slate-800">
                      {
                        section.label
                      }
                    </span>

                    {reviewed ? (
                      <CheckCircle2
                        className="size-5 text-emerald-700"
                        aria-label="Reviewed"
                      />
                    ) : (
                      <Circle
                        className="size-5 text-slate-400"
                        aria-label="Pending"
                      />
                    )}
                  </div>
                )
              },
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <UserRoundCheck
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assigned Preparer
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {assignedPreparer ??
                    "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <BriefcaseBusiness
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Workspace State
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  UI Preview
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Live organizer data and navigation will be connected in the next phase.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
