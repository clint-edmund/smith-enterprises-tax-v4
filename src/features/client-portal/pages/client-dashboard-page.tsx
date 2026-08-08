import {
  AlertCircle,
  DollarSign,
  FileText,
  RefreshCw,
  UserRound,
} from "lucide-react"

import {
  useClientDashboard,
} from "@/features/client-portal/hooks/use-client-dashboard"

import {
  useTaxOrganizer,
} from "@/features/client-portal/hooks/use-tax-organizer"

import {
  taxOrganizerSections,
} from "@/features/client-portal/constants/tax-organizer-sections"

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(value)
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not available"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not available"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(date)
}

function formatLabel(
  value: string | null,
): string {
  if (!value) {
    return "Not available"
  }

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
}

function getStatusClasses(
  status: string | null,
): string {
  switch (status) {
    case "completed":
    case "filed":
    case "approved":
      return (
        "bg-emerald-100 " +
        "text-emerald-800"
      )

    case "information_needed":
    case "waiting_for_documents":
    case "on_hold":
      return (
        "bg-amber-100 " +
        "text-amber-800"
      )

    case "rejected":
    case "cancelled":
      return (
        "bg-red-100 " +
        "text-red-800"
      )

    case "in_progress":
    case "under_review":
    case "ready_for_review":
      return (
        "bg-blue-100 " +
        "text-blue-800"
      )

    default:
      return (
        "bg-slate-100 " +
        "text-slate-700"
      )
  }
}

function DashboardLoadingState() {
  return (
    <section
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading client dashboard"
    >
      <div className="space-y-3">
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />

        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border bg-white shadow-sm" />

        <div className="h-64 animate-pulse rounded-xl border bg-white shadow-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border bg-white shadow-sm"
          />
        ))}
      </div>
    </section>
  )
}

interface DashboardErrorStateProps {
  message: string

  onRetry: () => Promise<void>
}

function DashboardErrorState({
  message,
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-6 w-6 shrink-0 text-red-600"
          aria-hidden="true"
        />

        <div>
          <h1 className="text-xl font-semibold text-red-900">
            We couldn't load your dashboard
          </h1>

          <p className="mt-2 text-sm text-red-800">
            {message}
          </p>

          <button
            type="button"
            onClick={() => {
              void onRetry()
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Try Again
          </button>
        </div>
      </div>
    </section>
  )
}

export function ClientDashboardPage() {
  const {
    dashboard,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useClientDashboard()

  const organizerTaxYear =
    dashboard?.currentTaxYear ??
    new Date().getFullYear()

  const {
    summary: organizerSummary,
    currentSection,
    isLoading: isOrganizerLoading,
    errorMessage: organizerError,
    refresh: refreshOrganizer,
  } = useTaxOrganizer(
    organizerTaxYear,
)

  if (isLoading) {
    return <DashboardLoadingState />
  }

  if (error && !dashboard) {
    return (
      <DashboardErrorState
        message={error}
        onRetry={refresh}
      />
    )
  }

  if (!dashboard) {
    return (
      <DashboardErrorState
        message="No dashboard information was returned for this account."
        onRetry={refresh}
      />
    )
  }

  const displayName =
    dashboard.preferredName?.trim() ||
    dashboard.firstName

  const netPreparationFee =
    Math.max(
      dashboard.preparationFee -
        dashboard.discountAmount,
      0,
    )

  const hasCurrentReturn =
    dashboard.currentReturnId !== null

  const organizerProgress =
    organizerSummary?.organizer
      .progressPercentage ?? 0

  const completedSections =
    organizerSummary?.completedSections ??
    0

  const totalSections =
    organizerSummary?.totalSections ??
    13

  const remainingSections =
    Math.max(
      totalSections -
        completedSections,
      0,
    )

  const organizerStatus =
    organizerSummary?.organizer.status ??
    "not_started"

  const organizerActionLabel =
    organizerStatus === "submitted" ||
    organizerStatus === "under_review" ||
    organizerStatus === "approved"
      ? "View Organizer"
      : organizerProgress > 0
        ? "Continue Organizer"
        : "Start Tax Organizer"

  const currentSectionDefinition =
    currentSection
      ? taxOrganizerSections.find(
          (section) =>
            section.key ===
            currentSection.sectionKey,
        )
      : null


  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Client Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Welcome back, {displayName}
          </h1>

          <p className="mt-2 text-slate-600">
            Here's the latest information about your tax account.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Client #{dashboard.clientNumber}
          </p>
        </div>

        <button
          type="button"
          disabled={isRefreshing}
          onClick={() => {
            void refresh()
          }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRefreshing
                ? "animate-spin"
                : ""
            }`}
            aria-hidden="true"
          />

          {isRefreshing
            ? "Refreshing"
            : "Refresh"}
        </button>
      </header>
      
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-950 to-slate-950 p-6 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-200">
                  {organizerTaxYear} Tax Organizer
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  Secure Tax Intake
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Complete your organizer, upload supporting documents, and securely
                  provide the information needed to prepare your return.
                </p>
              </div>

              {organizerSummary && (
                <span
                  className={`inline-flex self-start rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    organizerStatus === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : organizerStatus === "submitted" ||
                          organizerStatus === "under_review"
                        ? "bg-blue-100 text-blue-800"
                        : organizerStatus === "changes_requested"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-white/10 text-white"
                  }`}
                >
                  {formatLabel(
                    organizerStatus,
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {isOrganizerLoading ? (
              <div
                role="status"
                className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"
              >
                <RefreshCw
                  className="mx-auto h-6 w-6 animate-spin text-slate-400"
                  aria-hidden="true"
                />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Loading your tax organizer...
                </p>
              </div>
            ) : organizerError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-5"
              >
                <div className="flex gap-3">
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="font-semibold text-red-900">
                      Unable to load your tax organizer
                    </p>

                    <p className="mt-2 text-sm text-red-700">
                      {organizerError}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        void refreshOrganizer()
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                    >
                      <RefreshCw
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : organizerSummary ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Overall progress
                    </p>

                    <p className="text-sm font-bold text-slate-950">
                      {organizerProgress}%
                    </p>
                  </div>

                  <div
                    className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={
                      organizerProgress
                    }
                    aria-label="Tax organizer progress"
                  >
                    <div
                      className="h-full rounded-full bg-blue-700 transition-all"
                      style={{
                        width: `${organizerProgress}%`,
                      }}
                    />
                  </div>
                </div>

                <dl className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Current section
                    </dt>

                    <dd className="mt-2 font-semibold text-slate-950">
                      {currentSectionDefinition?.title ??
                        "Personal Information"}
                    </dd>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Completed
                    </dt>

                    <dd className="mt-2 text-2xl font-bold text-emerald-700">
                      {completedSections}
                    </dd>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Remaining
                    </dt>

                    <dd className="mt-2 text-2xl font-bold text-slate-950">
                      {remainingSections}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  disabled
                  title="Organizer navigation will be connected in the next phase."
                  className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white opacity-60 sm:w-auto"
                >
                  {organizerActionLabel}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-semibold text-slate-900">
                  Your organizer is not available yet.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Refresh the page or contact Smith Enterprises for assistance.
                </p>
              </div>
            )}
          </div>
        </article>


      {error ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <p>
            The most recent refresh was unsuccessful. The dashboard is showing the last available information.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Current Return
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {hasCurrentReturn
                  ? `${
                      dashboard.currentTaxYear ??
                      "Current"
                    } ${formatLabel(
                      dashboard.currentReturnType,
                    )} Return`
                  : "No current return"}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <FileText
                className="h-6 w-6 text-blue-700"
                aria-hidden="true"
              />
            </div>
          </div>

          {hasCurrentReturn ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-slate-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                    dashboard.currentReturnStatus,
                  )}`}
                >
                  {formatLabel(
                    dashboard.currentReturnStatus,
                  )}
                </span>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">
                    Tax form
                  </dt>

                  <dd className="mt-1 font-medium text-slate-900">
                    {formatLabel(
                      dashboard.currentTaxForm,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500">
                    Last updated
                  </dt>

                  <dd className="mt-1 font-medium text-slate-900">
                    {formatDate(
                      dashboard.currentReturnUpdatedAt,
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="mt-6 text-sm leading-6 text-slate-600">
              A tax return has not yet been added to your client account.
            </p>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Assigned Preparer
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {dashboard.assignedPreparerName ??
                  "Not yet assigned"}
              </h2>
            </div>

            <div className="rounded-lg bg-violet-50 p-3">
              <UserRound
                className="h-6 w-6 text-violet-700"
                aria-hidden="true"
              />
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-600">
            Your assigned preparer will review your documents and update your return as work progresses.
          </p>

          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Need assistance?
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Contact the Smith Enterprises office for questions about your return or account.
            </p>
          </div>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Preparation Fee
            </p>

            <DollarSign
              className="h-5 w-5 text-slate-400"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {formatCurrency(
              dashboard.preparationFee,
            )}
          </p>

          {dashboard.discountAmount > 0 ? (
            <p className="mt-2 text-sm text-emerald-700">
              Includes a{" "}
              {formatCurrency(
                dashboard.discountAmount,
              )}{" "}
              discount
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No discount applied
            </p>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Net Fee
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {formatCurrency(
              netPreparationFee,
            )}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            After discounts
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Payments Received
          </p>

          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {formatCurrency(
              dashboard.totalPayments,
            )}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Total recorded payments
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Outstanding Balance
          </p>

          <p
            className={`mt-3 text-2xl font-bold ${
              dashboard.outstandingBalance > 0
                ? "text-amber-700"
                : "text-emerald-700"
            }`}
          >
            {formatCurrency(
              dashboard.outstandingBalance,
            )}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {dashboard.outstandingBalance > 0
              ? "Remaining amount due"
              : "No balance currently due"}
          </p>
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Documents
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {dashboard.documentCount}{" "}
              {dashboard.documentCount === 1
                ? "document"
                : "documents"}{" "}
              uploaded
            </h2>
          </div>

          <div className="rounded-lg bg-cyan-50 p-3">
            <FileText
              className="h-6 w-6 text-cyan-700"
              aria-hidden="true"
            />
          </div>
        </div>

        {dashboard.recentDocumentId ? (
          <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Most Recent Document
              </p>

              <p className="mt-1 break-words font-semibold text-slate-900">
                {dashboard.recentDocumentName ??
                  "Unnamed document"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Uploaded
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatDate(
                  dashboard.recentDocumentUploadedAt,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatLabel(
                  dashboard.recentDocumentCategory,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatLabel(
                  dashboard.recentDocumentStatus,
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <FileText
              className="mx-auto h-8 w-8 text-slate-400"
              aria-hidden="true"
            />

            <p className="mt-3 font-medium text-slate-800">
              No documents uploaded
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Uploaded tax documents will appear here.
            </p>
          </div>
        )}
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Messages",
            description:
              "Secure messaging with your tax office is coming soon.",
          },
          {
            title: "Appointments",
            description:
              "Online appointment scheduling is coming soon.",
          },
          {
            title: "Electronic Signatures",
            description:
              "Secure electronic signatures are coming soon.",
          },
        ].map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"
          >
            <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Coming Soon
            </span>

            <h2 className="mt-4 font-semibold text-slate-900">
              {feature.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}