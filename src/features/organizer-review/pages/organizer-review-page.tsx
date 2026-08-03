import {
  ArrowLeft,
  RefreshCw,
} from "lucide-react"

import {
  Link,
  useParams,
} from "react-router-dom"

import {
  appConfig,
  getClientDetailsRoute,
} from "@/config/app-config"

import {
  OrganizerReviewActions,
  OrganizerReviewClientCard,
  OrganizerReviewHeader,
  OrganizerReviewIssueList,
  OrganizerReviewSectionList,
  OrganizerReviewSummary,
} from "@/features/organizer-review/components"

import {
  useOrganizerReview,
} from "@/features/organizer-review/hooks"

function parseTaxYear(
  value:
    string | undefined,
): number | null {
  if (!value) {
    return null
  }

  const parsedValue =
    Number(value)

  if (
    !Number.isInteger(
      parsedValue,
    ) ||
    parsedValue < 1900 ||
    parsedValue > 2200
  ) {
    return null
  }

  return parsedValue
}

export function OrganizerReviewPage() {
  const {
    clientId,
    taxYear:
      taxYearParameter,
  } = useParams<{
    clientId: string
    taxYear: string
  }>()

  const taxYear =
    parseTaxYear(
      taxYearParameter,
    )

  const normalizedClientId =
    clientId?.trim() ?? ""

  const {
    overview,
    isLoading,
    errorMessage,
    refresh,
  } = useOrganizerReview(
    normalizedClientId,
    taxYear ?? 0,
  )

  if (
    !normalizedClientId ||
    taxYear === null
  ) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Organizer review unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            A valid client identifier and tax year are required to open this
            organizer review.
          </p>

          <Link
            to={
              appConfig.routes.clients
            }
            className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:text-blue-800"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Return to Clients
          </Link>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading organizer review...
          </p>
        </div>
      </section>
    )
  }

  if (
    errorMessage ||
    !overview
  ) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Organizer review unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {errorMessage ??
              "The organizer review could not be loaded."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void refresh()
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden="true"
              />

              Try Again
            </button>

            <Link
              to={
                getClientDetailsRoute(
                  normalizedClientId,
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Return to Client
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={
            getClientDetailsRoute(
              overview.clientId,
            )
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Back to Client Workspace
        </Link>

        <button
          type="button"
          onClick={() => {
            void refresh()
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw
            className="h-4 w-4"
            aria-hidden="true"
          />

          Refresh Review
        </button>
      </div>

      <OrganizerReviewHeader
        overview={
          overview
        }
      />

      <OrganizerReviewSummary
        overview={
          overview
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <main className="min-w-0 space-y-6">
          <OrganizerReviewSectionList
            overview={
              overview
            }
          />

          <OrganizerReviewIssueList
            overview={
              overview
            }
          />
        </main>

        <aside className="space-y-6 xl:sticky xl:top-6">
          <OrganizerReviewClientCard
            overview={
              overview
            }
          />

          <OrganizerReviewActions />
        </aside>
      </div>
    </section>
  )
}
