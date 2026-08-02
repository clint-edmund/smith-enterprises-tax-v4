import {
  OrganizerPage,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  OrganizerOverviewSummary,
  OrganizerSectionCard,
} from "@/features/client-portal/components/organizer/shared"

import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"

import {
  useOrganizerIncome,
} from "@/features/client-portal/hooks/use-organizer-income"

import {
  calculateIncomeHealth,
  calculateOrganizerHealth,
} from "@/features/client-portal/services/organizer-health"

export function OrganizerOverviewPage() {
  const {
    organizer,
    taxYear,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    incomeSources,
    isLoading,
    errorMessage,
  } =
    useOrganizerIncome(
      organizerId,
    )

  const incomeHealth =
    calculateIncomeHealth({
      incomeSources,
    })

  const organizerHealth =
    calculateOrganizerHealth({
      organizerId,

      taxYear,

      sections: [
        incomeHealth,
      ],
    })

  return (
    <OrganizerPage
      sectionKey="income"
      title="Organizer Overview"
      description="Review the completion status, outstanding issues, and readiness of your tax organizer."
      loadingMessage="Loading your organizer overview..."
    >
      <div className="space-y-8">
        {errorMessage && (
          <OrganizerValidationSummary
            variant="error"
            title="Unable to load organizer health"
            message={
              errorMessage
            }
          />
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600 shadow-sm">
            Loading organizer health...
          </div>
        ) : (
          <>
            <OrganizerOverviewSummary
              health={
                organizerHealth
              }
            />

            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Organizer Sections
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open a section to continue working on incomplete information
                  or review completed records.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <OrganizerSectionCard
                  section={
                    incomeHealth
                  }
                  href="/client/organizer/income"
                />
              </div>
            </section>

            {organizerHealth.totalIssueCount >
              0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Outstanding Items
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Resolve these items before submitting the organizer for
                    review.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {organizerHealth.sections.flatMap(
                    (section) =>
                      section.issues,
                  ).map(
                    (issue) => (
                      <article
                        key={
                          issue.issueId
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {issue.title}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {
                                issue.description
                              }
                            </p>
                          </div>

                          {issue.actionPath &&
                            issue.actionLabel && (
                            <a
                              href={
                                issue.actionPath
                              }
                              className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
                            >
                              {
                                issue.actionLabel
                              }
                            </a>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </OrganizerPage>
  )
}