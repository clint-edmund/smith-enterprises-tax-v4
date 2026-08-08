import {
  Link,
} from "react-router-dom"

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock3,
  RefreshCw,
  RotateCcw,
  UserRoundCheck,
} from "lucide-react"

import type {
  ClientOrganizerWorkspace,
  ClientOrganizerWorkspaceSection,
} from "@/features/clients/types/client-organizer-workspace.types"

interface OrganizerWorkspaceCardProps {
  clientName: string
  workspace:
    ClientOrganizerWorkspace | null
  isLoading: boolean
  isRefreshing: boolean
  errorMessage:
    string | null
  fallbackTaxYear: number
  fallbackAssignedPreparer:
    string | null
  onRefresh: () => void
}

function formatTimestamp(
  value:
    string | null,
): string {
  if (!value) {
    return "No activity yet"
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    date,
  )
}

function formatStatus(
  value: string,
): string {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
}

function getSectionClasses(
  section:
    ClientOrganizerWorkspaceSection,
): string {
  if (
    section.status ===
    "reviewed"
  ) {
    return "border-emerald-200 bg-emerald-50"
  }

  if (
    section.status ===
      "needs_follow_up" ||
    section.status ===
      "returned_to_client"
  ) {
    return "border-amber-200 bg-amber-50"
  }

  return "border-slate-200 bg-slate-50"
}

export function OrganizerWorkspaceCard({
  clientName,
  workspace,
  isLoading,
  isRefreshing,
  errorMessage,
  fallbackTaxYear,
  fallbackAssignedPreparer,
  onRefresh,
}: OrganizerWorkspaceCardProps) {
  const organizer =
    workspace?.organizer ??
    null

  const hasOrganizer =
    workspace?.hasOrganizer ??
    false

  const taxYear =
    organizer?.taxYear ??
    fallbackTaxYear

  const assignedPreparer =
    workspace?.assignment
      ?.preparerName ??
    fallbackAssignedPreparer

  const sections =
    workspace?.sections ??
    []

  const reviewedSections =
    sections.filter(
      (section) =>
        section.status ===
        "reviewed",
    ).length

  const implementedSections =
    sections.filter(
      (section) =>
        section.isImplemented,
    ).length

  const reviewPercentage =
    workspace?.reviewSummary
      .reviewPercentage ??
    0

  const organizerReviewPath =
    organizer
      ? `/clients/${organizer.clientId}/organizer-review/${organizer.taxYear}`
      : null

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <RefreshCw
          className="mx-auto size-8 animate-spin text-blue-700"
          aria-hidden="true"
        />

        <p className="mt-4 font-semibold text-slate-800">
          Loading Organizer Workspace...
        </p>
      </section>
    )
  }

  if (
    errorMessage &&
    !workspace
  ) {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Organizer Workspace unavailable
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={
            onRefresh
          }
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          <RotateCcw
            className="size-4"
            aria-hidden="true"
          />
          Try Again
        </button>
      </section>
    )
  }

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

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                onRefresh
              }
              disabled={
                isRefreshing
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={[
                  "size-4",
                  isRefreshing
                    ? "animate-spin"
                    : "",
                ].join(" ")}
                aria-hidden="true"
              />
              Refresh
            </button>

            {organizerReviewPath ? (
              <Link
                to={
                  organizerReviewPath
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-blue-50"
              >
                Open Organizer Review
                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="No organizer is available to review."
                className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-white/20"
              >
                Open Organizer Review
                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {!hasOrganizer ? (
        <div className="p-7 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <ClipboardCheck
              className="size-7"
              aria-hidden="true"
            />
          </div>

          <h3 className="mt-5 text-xl font-bold text-slate-950">
            No organizer found
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            No tax organizer has been created for this client. Organizer creation and invitation controls will be connected in a later phase.
          </p>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Suggested tax year:{" "}
            {taxYear}
          </p>
        </div>
      ) : (
        <>
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
                  {
                    formatStatus(
                      organizer?.status ??
                      "not started",
                    )
                  }
                </span>
              </div>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Completion
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  organizer
                    ?.progressPercentage ??
                  0
                }
                %
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

                {
                  formatTimestamp(
                    organizer?.lastSavedAt ??
                    organizer?.updatedAt ??
                    null,
                  )
                }
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
                    {reviewedSections} of{" "}
                    {implementedSections} implemented sections reviewed
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
                {sections.map(
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
                          getSectionClasses(
                            section,
                          ),
                          !section.isImplemented
                            ? "opacity-60"
                            : "",
                        ].join(" ")}
                      >
                        <div>
                          <span className="font-semibold text-slate-800">
                            {
                              section.label
                            }
                          </span>

                          {!section.isImplemented && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              Planned
                            </p>
                          )}
                        </div>

                        {reviewed ? (
                          <CheckCircle2
                            className="size-5 text-emerald-700"
                            aria-label="Reviewed"
                          />
                        ) : (
                          <Circle
                            className="size-5 text-slate-400"
                            aria-label={
                              formatStatus(
                                section.status,
                              )
                            }
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
                      Income Review
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {
                        workspace
                          ?.reviewSummary
                          .reviewedCount ??
                        0
                      }
                      {" "}
                      of{" "}
                      {
                        workspace
                          ?.reviewSummary
                          .incomeSourceCount ??
                        0
                      }
                      {" "}
                      reviewed
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">
                      Follow-up
                    </dt>

                    <dd className="font-bold text-amber-800">
                      {
                        workspace
                          ?.reviewSummary
                          .needsFollowUpCount ??
                        0
                      }
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">
                      Returned
                    </dt>

                    <dd className="font-bold text-red-800">
                      {
                        workspace
                          ?.reviewSummary
                          .returnedToClientCount ??
                        0
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  )
}
