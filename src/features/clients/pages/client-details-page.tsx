import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CalendarDays,
  Cake,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Edit3,
  Flag,
  FilePlus2,
  FileText,
  Gauge,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Link,
  useParams,
} from "react-router-dom"

import {
  appConfig,
  getClientEditRoute,
  getNewClientReturnRoute,
  getReturnDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getClientById } from "@/features/clients/services/client-service"
import type {
  ClientRecord,
} from "@/features/clients/types/client.types"
import {
  formatClientName,
  formatClientNumber,
  formatDate,
} from "@/features/clients/utils/client-formatters"
import { ReturnStatusBadge } from "@/features/returns/components/return-status-badge"
import { getClientTaxReturns } from "@/features/returns/services/return-service"
import type {
  ClientTaxReturnItem,
} from "@/features/returns/types/return.types"
import {
  formatReturnCurrency,
  formatReturnDate,
  returnTypeLabels,
  taxFormLabels,
} from "@/features/returns/utils/return-formatters"
import {
  ClientCommandBar,
} from "@/features/clients/components/client-command-bar"
import {
  ClientHealthCard,
} from "@/features/clients/components/client-health-card"

import {
  ClientProfileProgress,
} from "@/features/clients/components/client-profile-progress"

import {
  ClientSmartAlerts,
} from "@/features/clients/components/client-smart-alerts"
import {
  ClientTaxSeasonTimeline,
} from "@/features/clients/components/client-tax-season-timeline"
import {
  ClientCommunicationCenter,
} from "@/features/clients/components/client-communication-center"

const editRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

export function ClientDetailsPage() {
  const { clientId } = useParams()
  const { profile } = useAuth()

  const [client, setClient] =
    useState<ClientRecord | null>(null)

  const [clientReturns, setClientReturns] =
    useState<ClientTaxReturnItem[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isRefreshingReturns, setIsRefreshingReturns] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [returnsErrorMessage, setReturnsErrorMessage] =
    useState<string | null>(null)

  const [todayStart] = useState(() => {
    const today = new Date()

    today.setHours(
      0,
      0,
      0,
      0,
    )

    return today.getTime()
  })

  const loadClientReturns = useCallback(
    async (showRefreshing = false) => {
      if (!clientId) {
        return
      }

      if (showRefreshing) {
        setIsRefreshingReturns(true)
      }

      setReturnsErrorMessage(null)

      try {
        const results =
          await getClientTaxReturns(clientId)

        setClientReturns(results)
      } catch (error) {
        console.error(
          "Unable to load client returns:",
          error,
        )

        setReturnsErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this client's returns.",
        )
      } finally {
        setIsRefreshingReturns(false)
      }
    },
    [clientId],
  )

  useEffect(() => {
    async function loadPage() {
      if (!clientId) {
        setErrorMessage(
          "The client identifier is missing.",
        )
        setIsLoading(false)
        return
      }

      setErrorMessage(null)

      try {
        const [clientResult, returnResults] =
          await Promise.all([
            getClientById(clientId),
            getClientTaxReturns(clientId),
          ])

        if (!clientResult) {
          setErrorMessage(
            "The client record was not found.",
          )
          return
        }

        setClient(clientResult)
        setClientReturns(returnResults)
      } catch (error) {
        console.error(
          "Unable to load client details:",
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the client.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPage()
  }, [clientId])

  const clientSummary = useMemo(() => {
    if (!client) {
      return {
        activityItems: [],
        sortedReturns: [],
        openReturns: 0,
        completedReturns: 0,
        totalNetFees: 0,
        averageNetFee: 0,
        latestTaxYear: null,
        upcomingDueReturn: undefined,
        overdueReturns: 0,
        mostRecentReturn: undefined,
        preparerNames: [],
        reviewerNames: [],
      }
    }

    const currentClient = client

    const closedStatuses = new Set([
      "completed",
      "accepted",
    ])

    const openReturns =
      clientReturns.filter(
        (taxReturn) =>
          !closedStatuses.has(
            taxReturn.status,
          ),
      ).length

    const totalNetFees =
      clientReturns.reduce(
        (total, taxReturn) =>
          total + taxReturn.netFee,
        0,
      )

    const mostRecentReturn =
      [...clientReturns].sort(
        (firstReturn, secondReturn) =>
          new Date(
            secondReturn.updatedAt,
          ).getTime() -
          new Date(
            firstReturn.updatedAt,
          ).getTime(),
      )[0]

    const preparerNames =
      Array.from(
        new Set(
          clientReturns
            .map(
              (taxReturn) =>
                taxReturn.assignedPreparerName,
            )
            .filter(
              (
                name,
              ): name is string =>
                Boolean(name),
            ),
        ),
      )

    const reviewerNames =
      Array.from(
        new Set(
          clientReturns
            .map(
              (taxReturn) =>
                taxReturn.assignedReviewerName,
            )
            .filter(
              (
                name,
              ): name is string =>
                Boolean(name),
            ),
        ),
      )

    const completedReturns =
      clientReturns.filter(
        (taxReturn) =>
          closedStatuses.has(
            taxReturn.status,
          ),
      ).length

    const averageNetFee =
      clientReturns.length > 0
        ? totalNetFees /
          clientReturns.length
        : 0

    const latestTaxYear =
      clientReturns.length > 0
        ? Math.max(
            ...clientReturns.map(
              (taxReturn) =>
                taxReturn.taxYear,
            ),
          )
        : null

    const upcomingDueReturn =
      clientReturns
        .filter((taxReturn) => {
          if (
            !taxReturn.dueDate ||
            closedStatuses.has(
              taxReturn.status,
            )
          ) {
            return false
          }

          return (
            new Date(
              taxReturn.dueDate,
            ).getTime() >= todayStart
          )
        })
        .sort(
          (firstReturn, secondReturn) =>
            new Date(
              firstReturn.dueDate!,
            ).getTime() -
            new Date(
              secondReturn.dueDate!,
            ).getTime(),
        )[0]

    const overdueReturns =
      clientReturns.filter(
        (taxReturn) =>
          Boolean(
            taxReturn.dueDate,
          ) &&
          !closedStatuses.has(
            taxReturn.status,
          ) &&
          new Date(
            taxReturn.dueDate!,
          ).getTime() < todayStart
      ).length

    const activityItems = [
      {
        id: `client-created-${currentClient.id}`,
        label: "Client record created",
        description: `${formatClientName(currentClient)} was added to the client directory.`,
        occurredAt: currentClient.createdAt,
        icon: UsersRound,
        tone: "blue",
      },
      {
        id: `client-updated-${currentClient.id}`,
        label: "Client information updated",
        description: "The client profile was most recently updated.",
        occurredAt: currentClient.updatedAt,
        icon: Edit3,
        tone: "slate",
      },
      ...clientReturns.flatMap((taxReturn) => {
        const returnLabel = `${taxReturn.taxYear} ${
          taxFormLabels[taxReturn.taxForm]
        }`

        const items = [
          {
            id: `return-created-${taxReturn.id}`,
            label: "Tax return created",
            description: `${returnLabel} was added to the client portfolio.`,
            occurredAt: taxReturn.createdAt,
            icon: FilePlus2,
            tone: "violet",
          },
          {
            id: `return-updated-${taxReturn.id}`,
            label: "Return activity updated",
            description: `${returnLabel} is currently ${taxReturn.status.replaceAll(
              "_",
              " ",
            )}.`,
            occurredAt: taxReturn.updatedAt,
            icon: Activity,
            tone: "amber",
          },
        ]

        if (taxReturn.filedDate) {
          items.push({
            id: `return-filed-${taxReturn.id}`,
            label: "Return filed",
            description: `${returnLabel} was marked as filed.`,
            occurredAt: taxReturn.filedDate,
            icon: Flag,
            tone: "blue",
          })
        }

        if (taxReturn.acceptedDate) {
          items.push({
            id: `return-accepted-${taxReturn.id}`,
            label: "Return accepted",
            description: `${returnLabel} was accepted.`,
            occurredAt: taxReturn.acceptedDate,
            icon: CheckCircle2,
            tone: "emerald",
          })
        }

        return items
      }),
    ]
      .filter((item) => Boolean(item.occurredAt))
      .sort(
        (firstItem, secondItem) =>
          new Date(secondItem.occurredAt).getTime() -
          new Date(firstItem.occurredAt).getTime(),
      )
      .slice(0, 10)

    const sortedReturns =
      [...clientReturns].sort(
        (firstReturn, secondReturn) => {
          if (
            secondReturn.taxYear !==
            firstReturn.taxYear
          ) {
            return (
              secondReturn.taxYear -
              firstReturn.taxYear
            )
          }

          return (
            new Date(
              secondReturn.updatedAt,
            ).getTime() -
            new Date(
              firstReturn.updatedAt,
            ).getTime()
          )
        },
      )

    return {
      activityItems,
      sortedReturns,
      openReturns,
      completedReturns,
      totalNetFees,
      averageNetFee,
      latestTaxYear,
      upcomingDueReturn,
      overdueReturns,
      mostRecentReturn,
      preparerNames,
      reviewerNames,
    }
  }, [
    client,
    clientReturns,
    todayStart,
  ])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Loading client...
      </div>
    )
  }

  if (errorMessage || !client) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-950">
          Client unavailable
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage ??
            "The client record could not be loaded."}
        </p>

        <Link
          to={appConfig.routes.clients}
          className="mt-6 inline-flex font-semibold text-blue-700"
        >
          Return to Clients
        </Link>
      </section>
    )
  }

  const canEdit =
    profile !== null &&
    editRoles.includes(profile.role)



  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white sm:p-8">
          <Link
            to={appConfig.routes.clients}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Clients
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {formatClientName(client)}
                </h1>

                <span
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide",
                    client.status === "active"
                      ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-100"
                      : client.status === "inactive"
                        ? "border-amber-300/50 bg-amber-400/15 text-amber-100"
                        : "border-slate-300/40 bg-white/10 text-slate-200",
                  ].join(" ")}
                >
                  {client.status}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-slate-300">
                {formatClientNumber(client.clientNumber)}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Review this client&apos;s contact details, return history,
                assignments, and internal notes from one workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {canEdit && (
                <Link
                  to={getNewClientReturnRoute(client.id)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                >
                  <FilePlus2 className="size-5" aria-hidden="true" />
                  New Return
                </Link>
              )}

              {canEdit && (
                <Link
                  to={getClientEditRoute(client.id)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 shadow-sm transition hover:bg-blue-50"
                >
                  <Edit3 className="size-5" aria-hidden="true" />
                  Edit Client
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">Total Returns</p>
              <ClipboardList className="size-5 text-blue-600" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {clientReturns.length}
            </p>
          </div>

          <div className="bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">Open Returns</p>
              <FileText className="size-5 text-amber-600" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {clientSummary.openReturns}
            </p>
          </div>

          <div className="bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">Total Net Fees</p>
              <FilePlus2 className="size-5 text-emerald-600" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {formatReturnCurrency(clientSummary.totalNetFees)}
            </p>
          </div>

          <div className="bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">Last Return Activity</p>
              <Clock3 className="size-5 text-violet-600" aria-hidden="true" />
            </div>
            <p className="mt-3 text-lg font-bold text-slate-950">
              {clientSummary.mostRecentReturn
                ? formatReturnDate(clientSummary.mostRecentReturn.updatedAt)
                : "No activity"}
            </p>
          </div>
        </div>
      </header>
      
      <ClientCommandBar
        client={client}
        canEdit={canEdit}
      />

      <div className="grid gap-6 lg:grid-cols-2">
      <ClientHealthCard
        client={client}
        clientReturns={clientReturns}
      />

      <ClientProfileProgress
          client={client}
        />
      </div>

      <ClientSmartAlerts
        client={client}
        clientReturns={clientReturns}
      />

      <ClientTaxSeasonTimeline
        clientReturns={clientReturns}
      />

      <ClientCommunicationCenter
        client={client}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <UsersRound className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">Client Profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Personal and account information.
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preferred Name
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {client.preferredName || "Not provided"}
                </dd>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Cake className="size-4" aria-hidden="true" />
                  Birth Date
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {formatDate(client.birthDate)}
                </dd>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Record Created
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {formatDate(client.createdAt)}
                </dd>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Updated
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {formatDate(client.updatedAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Mail className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">Contact Information</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Primary communication and mailing details.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <Mail className="mt-0.5 size-5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-2 break-words font-medium text-slate-800">
                    {client.email || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <Phone className="mt-0.5 size-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="mt-2 font-medium text-slate-800">
                    {client.phone || "No primary phone"}
                  </p>
                  {client.alternatePhone && (
                    <p className="mt-1 text-sm text-slate-500">
                      Alternate: {client.alternatePhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4 sm:col-span-2">
                <MapPin className="mt-0.5 size-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mailing Address
                  </p>
                  <div className="mt-2 font-medium leading-6 text-slate-800">
                    {client.addressLine1 ? (
                      <>
                        <p>{client.addressLine1}</p>
                        {client.addressLine2 && <p>{client.addressLine2}</p>}
                        <p>
                          {[client.city, client.state].filter(Boolean).join(", ")}
                          {client.postalCode ? ` ${client.postalCode}` : ""}
                        </p>
                      </>
                    ) : (
                      <p>No address provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">Internal Notes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Staff-only context associated with this client.
            </p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {client.notes || "No internal notes have been recorded."}
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <UserRoundCheck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">Return Assignments</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Staff assigned across this client&apos;s returns.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preparers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {clientSummary.preparerNames.length > 0 ? (
                    clientSummary.preparerNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800"
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No preparer assigned</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviewers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {clientSummary.reviewerNames.length > 0 ? (
                    clientSummary.reviewerNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-800"
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No reviewer assigned</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Common client workflow shortcuts.
            </p>

            <div className="mt-5 grid gap-3">
              {canEdit && (
                <Link
                  to={getNewClientReturnRoute(client.id)}
                  className="inline-flex min-h-12 items-center justify-between gap-3 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <FilePlus2 className="size-5" />
                    Create New Return
                  </span>
                  <ArrowLeft className="size-4 rotate-180" />
                </Link>
              )}

              {canEdit && (
                <Link
                  to={getClientEditRoute(client.id)}
                  className="inline-flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Edit3 className="size-5" />
                    Edit Client Record
                  </span>
                  <ArrowLeft className="size-4 rotate-180" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  void loadClientReturns(true)
                }}
                disabled={isRefreshingReturns}
                className="inline-flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw
                    className={[
                      "size-5",
                      isRefreshingReturns ? "animate-spin" : "",
                    ].join(" ")}
                  />
                  Refresh Returns
                </span>
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Gauge
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Client Insights
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  At-a-glance return history and workload indicators.
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <CheckCircle2
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Completed Returns
                </dt>
                <dd className="text-lg font-bold text-slate-950">
                  {clientSummary.completedReturns}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <TrendingUp
                    className="size-4 text-blue-600"
                    aria-hidden="true"
                  />
                  Average Net Fee
                </dt>
                <dd className="text-lg font-bold text-slate-950">
                  {formatReturnCurrency(
                    clientSummary.averageNetFee,
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <dt className="text-sm font-medium text-slate-600">
                  Latest Tax Year
                </dt>
                <dd className="text-lg font-bold text-slate-950">
                  {clientSummary.latestTaxYear ??
                    "No returns"}
                </dd>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <CalendarDays
                    className="size-4 text-violet-600"
                    aria-hidden="true"
                  />
                  Next Upcoming Due Date
                </dt>
                <dd className="mt-2 font-bold text-slate-950">
                  {clientSummary.upcomingDueReturn
                    ? formatReturnDate(
                        clientSummary
                          .upcomingDueReturn
                          .dueDate,
                      )
                    : "No upcoming due date"}
                </dd>

                {clientSummary.upcomingDueReturn && (
                  <p className="mt-1 text-sm text-slate-500">
                    {
                      clientSummary
                        .upcomingDueReturn
                        .taxYear
                    }{" "}
                    {
                      taxFormLabels[
                        clientSummary
                          .upcomingDueReturn
                          .taxForm
                      ]
                    }
                  </p>
                )}
              </div>

              <div
                className={[
                  "rounded-2xl border p-4",
                  clientSummary.overdueReturns >
                  0
                    ? "border-red-200 bg-red-50"
                    : "border-emerald-200 bg-emerald-50",
                ].join(" ")}
              >
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <AlertTriangle
                    className={[
                      "size-4",
                      clientSummary.overdueReturns >
                      0
                        ? "text-red-600"
                        : "text-emerald-600",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  Overdue Open Returns
                </dt>
                <dd className="mt-2 text-2xl font-bold text-slate-950">
                  {clientSummary.overdueReturns}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Activity className="size-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">Recent Activity</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest profile and return milestones.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-1">
              {clientSummary.activityItems.map((item, index) => {
                const Icon = item.icon

                const iconClasses = {
                  blue: "bg-blue-100 text-blue-700",
                  violet: "bg-violet-100 text-violet-700",
                  amber: "bg-amber-100 text-amber-700",
                  emerald: "bg-emerald-100 text-emerald-700",
                  slate: "bg-slate-100 text-slate-700",
                }[item.tone]

                return (
                  <div
                    key={item.id}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {index < clientSummary.activityItems.length - 1 && (
                      <div
                        className="absolute left-5 top-10 h-[calc(100%-1rem)] w-px bg-slate-200"
                        aria-hidden="true"
                      />
                    )}

                    <div
                      className={[
                        "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full",
                        iconClasses,
                      ].join(" ")}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <p className="font-semibold text-slate-950">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {formatReturnDate(item.occurredAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="flex gap-3">
                <Sparkles
                  className="mt-0.5 size-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-slate-600">
                  Payment, document, note, and staff audit events can be added
                  once dedicated client-activity data is available.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <ClipboardList
                    className="size-5"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Return Portfolio
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review tax years, workflow status, assignments, due dates,
                    and fees for this client.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  void loadClientReturns(true)
                }}
                disabled={isRefreshingReturns}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={[
                    "size-4",
                    isRefreshingReturns
                      ? "animate-spin"
                      : "",
                  ].join(" ")}
                  aria-hidden="true"
                />
                Refresh
              </button>

              {canEdit && (
                <Link
                  to={getNewClientReturnRoute(client.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  <FilePlus2
                    className="size-4"
                    aria-hidden="true"
                  />
                  New Return
                </Link>
              )}
            </div>
          </div>

          {clientReturns.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                {clientReturns.length} total
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                {clientSummary.openReturns} open
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                {clientSummary.completedReturns} completed
              </span>
              {clientSummary.overdueReturns > 0 && (
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800">
                  {clientSummary.overdueReturns} overdue
                </span>
              )}
            </div>
          )}
        </div>

        {returnsErrorMessage ? (
          <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-5 sm:m-6">
            <p className="font-semibold text-red-900">
              Unable to load client returns
            </p>
            <p className="mt-2 text-sm text-red-700">
              {returnsErrorMessage}
            </p>
          </div>
        ) : clientReturns.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100">
              <FileText
                className="size-8 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              No returns found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              This client does not have any tax returns yet.
            </p>

            {canEdit && (
              <Link
                to={getNewClientReturnRoute(client.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                <FilePlus2
                  className="size-4"
                  aria-hidden="true"
                />
                Create First Return
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Return
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Assignment
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Dates
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Net Fee
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {clientSummary.sortedReturns.map((taxReturn) => {
                    const isClosed =
                      taxReturn.status === "completed" ||
                      taxReturn.status === "accepted"

                    const isOverdue =
                      Boolean(taxReturn.dueDate) &&
                      !isClosed &&
                      new Date(
                        taxReturn.dueDate!,
                      ).getTime() <
                        new Date().setHours(
                          0,
                          0,
                          0,
                          0,
                        )

                    return (
                      <tr
                        key={taxReturn.id}
                        className="group transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4">
                          <Link
                            to={getReturnDetailsRoute(taxReturn.id)}
                            className="focus-visible:outline-none"
                          >
                            <p className="font-semibold text-slate-950 transition group-hover:text-blue-800">
                              {taxReturn.taxYear}{" "}
                              {taxFormLabels[taxReturn.taxForm]}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {returnTypeLabels[taxReturn.returnType]}
                            </p>
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <ReturnStatusBadge
                            status={taxReturn.status}
                          />
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p className="font-medium">
                            {taxReturn.assignedPreparerName ||
                              "Unassigned preparer"}
                          </p>
                          <p className="mt-1 text-slate-500">
                            Reviewer:{" "}
                            {taxReturn.assignedReviewerName ||
                              "Unassigned"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p>
                            Received:{" "}
                            {formatReturnDate(taxReturn.dateReceived)}
                          </p>
                          <p
                            className={[
                              "mt-1 font-medium",
                              isOverdue
                                ? "text-red-700"
                                : "text-slate-500",
                            ].join(" ")}
                          >
                            Due:{" "}
                            {formatReturnDate(taxReturn.dueDate)}
                            {isOverdue ? " · Overdue" : ""}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-slate-950">
                          {formatReturnCurrency(taxReturn.netFee)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={getReturnDetailsRoute(taxReturn.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 hover:text-blue-900"
                          >
                            View Return
                            <ChevronRight
                              className="size-4"
                              aria-hidden="true"
                            />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 md:hidden">
              {clientSummary.sortedReturns.map((taxReturn) => {
                const isClosed =
                  taxReturn.status === "completed" ||
                  taxReturn.status === "accepted"

                const isOverdue =
                  Boolean(taxReturn.dueDate) &&
                  !isClosed &&
                  new Date(
                    taxReturn.dueDate!,
                  ).getTime() <
                    new Date().setHours(
                      0,
                      0,
                      0,
                      0,
                    )

                return (
                  <article
                    key={taxReturn.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {taxReturn.taxYear}{" "}
                          {taxFormLabels[taxReturn.taxForm]}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {returnTypeLabels[taxReturn.returnType]}
                        </p>
                      </div>

                      <ReturnStatusBadge
                        status={taxReturn.status}
                      />
                    </div>

                    <dl className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Preparer
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {taxReturn.assignedPreparerName ||
                            "Unassigned"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Reviewer
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {taxReturn.assignedReviewerName ||
                            "Unassigned"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Due Date
                        </dt>
                        <dd
                          className={[
                            "mt-1 font-semibold",
                            isOverdue
                              ? "text-red-700"
                              : "text-slate-900",
                          ].join(" ")}
                        >
                          {formatReturnDate(taxReturn.dueDate)}
                          {isOverdue ? " · Overdue" : ""}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Net Fee
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {formatReturnCurrency(taxReturn.netFee)}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      to={getReturnDetailsRoute(taxReturn.id)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      View Return
                      <ChevronRight
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>
    </section>
  )
}
