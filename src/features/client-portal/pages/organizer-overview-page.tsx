import {
  Link,
} from "react-router-dom"

import {
  OrganizerPage,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  OrganizerLoadingState,
  OrganizerOverviewSummary,
  OrganizerSectionCard,
} from "@/features/client-portal/components/organizer/shared"

import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"

import {
  useOrganizerDependents,
} from "@/features/client-portal/hooks/use-organizer-dependents"

import {
  useOrganizerHealthcare,
} from "@/features/client-portal/hooks/use-organizer-healthcare"

import {
  useOrganizerIncome,
} from "@/features/client-portal/hooks/use-organizer-income"

import {
  calculateDependentsHealth,
  calculateHealthcareHealth,
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
    dependents,
    isLoading:
      areDependentsLoading,
    errorMessage:
      dependentsErrorMessage,
  } =
    useOrganizerDependents(
      organizerId,
    )

  const {
    coverages,
    isLoading:
      isHealthcareLoading,
    errorMessage:
      healthcareErrorMessage,
  } =
    useOrganizerHealthcare(
      organizerId,
    )

  const {
    incomeSources,
    isLoading:
      isIncomeLoading,
    errorMessage:
      incomeErrorMessage,
  } =
    useOrganizerIncome(
      organizerId,
    )

  const dependentsHealth =
    calculateDependentsHealth({
      dependents,
    })

  const healthcareHealth =
    calculateHealthcareHealth({
      coverages,
    })

  const incomeHealth =
    calculateIncomeHealth({
      incomeSources,
    })

  const organizerHealth =
    calculateOrganizerHealth({
      organizerId,

      taxYear,

      sections: [
        dependentsHealth,
        incomeHealth,
        healthcareHealth,
      ],
    })

  const isLoading =
    areDependentsLoading ||
    isHealthcareLoading ||
    isIncomeLoading

  const errorMessages =
    [
      dependentsErrorMessage,
      incomeErrorMessage,
      healthcareErrorMessage,
    ].filter(
      (
        message,
      ): message is string =>
        Boolean(message),
    )

  const outstandingIssues =
    organizerHealth.sections.flatMap(
      (section) =>
        section.issues,
    )

  return (
    <OrganizerPage
      sectionKey="income"
      title="Organizer Overview"
      description="Review the completion status, outstanding issues, and readiness of your tax organizer."
      loadingMessage="Loading your organizer overview..."
    >
      <div className="space-y-8">
        {errorMessages.map(
          (
            message,
            index,
          ) => (
            <OrganizerValidationSummary
              key={`${message}-${index}`}
              variant="error"
              title="Unable to load organizer health"
              message={
                message
              }
            />
          ),
        )}

        {isLoading ? (
          <OrganizerLoadingState
            message="Loading organizer health..."
          />
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
                    dependentsHealth
                  }
                  href="/client/organizer/dependents"
                />

                <OrganizerSectionCard
                  section={
                    incomeHealth
                  }
                  href="/client/organizer/income"
                />

                <OrganizerSectionCard
                  section={
                    healthcareHealth
                  }
                  href="/client/organizer/healthcare"
                />
              </div>
            </section>

            {outstandingIssues.length >
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
                  {outstandingIssues.map(
                    (issue) => (
                      <article
                        key={
                          issue.issueId
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950">
                                {
                                  issue.title
                                }
                              </p>

                              <span
                                className={[
                                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                                  issue.severity ===
                                  "blocking"
                                    ? "bg-red-100 text-red-800"
                                    : issue.severity ===
                                        "warning"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-blue-100 text-blue-800",
                                ].join(" ")}
                              >
                                {issue.severity ===
                                "blocking"
                                  ? "Action Required"
                                  : issue.severity ===
                                      "warning"
                                    ? "Review"
                                    : "Information"}
                              </span>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {
                                issue.description
                              }
                            </p>
                          </div>

                          {issue.actionPath &&
                            issue.actionLabel && (
                            <Link
                              to={
                                issue.actionPath
                              }
                              className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
                            >
                              {
                                issue.actionLabel
                              }
                            </Link>
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
