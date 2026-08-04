import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileWarning,
  LockKeyhole,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import type {
  OrganizerReviewProgress,
} from "@/features/organizer-review/types"

interface OrganizerReviewReadinessCardProps {
  progress:
    OrganizerReviewProgress

  preparationHref?: string
}

export function OrganizerReviewReadinessCard({
  progress,
  preparationHref,
}: OrganizerReviewReadinessCardProps) {
  const remainingSections =
    progress.sections.filter(
      (section) =>
        section.isRequiredForPreparation &&
        (
          !section.isImplemented ||
          section.status !==
            "complete"
        ),
    )

  return (
    <section
      className={[
        "rounded-2xl border p-5 shadow-sm",
        progress.isReadyForPreparation
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            progress.isReadyForPreparation
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          ].join(" ")}
        >
          {progress.isReadyForPreparation ? (
            <CheckCircle2
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : (
            <CircleAlert
              className="h-5 w-5"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            Return Readiness
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {progress.isReadyForPreparation
              ? "Ready for Preparation"
              : "Not Ready for Preparation"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {progress.isReadyForPreparation
              ? "Every required organizer review section is implemented and complete, with no blocking issues or missing documents."
              : "Complete the remaining review sections and resolve blocking items before starting tax preparation."}
          </p>
        </div>
      </div>

      {!progress.isReadyForPreparation && (
        <div className="mt-5 space-y-4">
          {remainingSections.length >
            0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Remaining Sections
              </p>

              <ul className="mt-2 space-y-2">
                {remainingSections.map(
                  (section) => (
                    <li
                      key={
                        section.key
                      }
                      className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white/70 px-3 py-2.5"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800">
                        {!section.isImplemented && (
                          <LockKeyhole
                            className="h-4 w-4 shrink-0 text-slate-500"
                            aria-hidden="true"
                          />
                        )}

                        <span className="truncate">
                          {
                            section.title
                          }
                        </span>
                      </span>

                      <span className="shrink-0 text-xs font-semibold text-slate-600">
                        {section.isImplemented
                          ? section.status ===
                            "needs_attention"
                            ? "Needs Attention"
                            : section.status ===
                                "in_progress"
                              ? "In Progress"
                              : "Not Started"
                          : "Planned"}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-200 bg-white/70 p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <CircleAlert
                  className="h-4 w-4 text-amber-700"
                  aria-hidden="true"
                />

                Blocking Issues
              </dt>

              <dd className="mt-2 text-2xl font-bold text-slate-950">
                {
                  progress.blockingIssueCount
                }
              </dd>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white/70 p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <FileWarning
                  className="h-4 w-4 text-orange-700"
                  aria-hidden="true"
                />

                Missing Documents
              </dt>

              <dd className="mt-2 text-2xl font-bold text-slate-950">
                {
                  progress.missingDocumentCount
                }
              </dd>
            </div>
          </dl>
        </div>
      )}

      {progress.isReadyForPreparation &&
        preparationHref && (
        <Link
          to={
            preparationHref
          }
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Begin Tax Preparation

          <ArrowRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      )}
    </section>
  )
}
