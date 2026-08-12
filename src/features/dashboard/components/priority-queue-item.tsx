import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  RiskFactorList,
} from "@/features/dashboard/components/risk-factor-list"
import {
  getClientDetailsRoute,
} from "@/config/app-config"
import {
  RiskLevelBadge,
} from "@/features/dashboard/components/risk-level-badge"
import {
  RiskScoreIndicator,
} from "@/features/dashboard/components/risk-score-indicator"
import type {
  DashboardPriorityItem,
} from "@/features/dashboard/types/dashboard.types"
import {
  AssignPreparerDialog,
} from "@/features/returns/components/assign-preparer-dialog"
import {
  assignTaxReturnPreparer,
} from "@/features/returns/services/return-service"

type PriorityQueueItemProps = {
  item: DashboardPriorityItem
  onPriorityItemUpdated: () => void
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not set"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not set"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date)
}

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

function getDueDateLabel(
  daysUntilDue: number | null,
  dueDate: string | null,
): string {
  if (daysUntilDue === null) {
    return formatDate(dueDate)
  }

  if (daysUntilDue < 0) {
    const overdueDays =
      Math.abs(daysUntilDue)

    return `${overdueDays} ${
      overdueDays === 1 ? "day" : "days"
    } overdue`
  }

  if (daysUntilDue === 0) {
    return "Due today"
  }

  if (daysUntilDue === 1) {
    return "Due tomorrow"
  }

  return `Due in ${daysUntilDue} days`
}

function getActivityLabel(
  daysSinceActivity: number | null,
): string {
  if (daysSinceActivity === null) {
    return "No recent activity"
  }

  if (daysSinceActivity === 0) {
    return "Activity today"
  }

  if (daysSinceActivity === 1) {
    return "Last activity yesterday"
  }

  return `Last activity ${daysSinceActivity} days ago`
}

export function PriorityQueueItem({
  item,
  onPriorityItemUpdated,
}: PriorityQueueItemProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  const [
    isQuickActionsOpen,
    setIsQuickActionsOpen,
  ] = useState(false)

  const [
    isAssignPreparerOpen,
    setIsAssignPreparerOpen,
  ] = useState(false)

  const [
    actionMessage,
    setActionMessage,
  ] = useState<string | null>(null)

  const [
    actionMessageType,
    setActionMessageType,
  ] = useState<
    "success" | "error"
  >("success")

  const quickActionsContainerRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const quickActionsButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
    )

  useEffect(() => {
      if (!isQuickActionsOpen) {
        return
      }

      function handlePointerDown(
        event: MouseEvent,
      ) {
        const target =
          event.target as Node

        if (
          quickActionsContainerRef.current &&
          !quickActionsContainerRef.current.contains(
            target,
          )
        ) {
          setIsQuickActionsOpen(false)
        }
      }

      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (event.key !== "Escape") {
          return
        }

        setIsQuickActionsOpen(false)

        quickActionsButtonRef.current?.focus()
      }

      document.addEventListener(
        "mousedown",
        handlePointerDown,
      )

      document.addEventListener(
        "keydown",
        handleKeyDown,
      )

      return () => {
        document.removeEventListener(
          "mousedown",
          handlePointerDown,
        )

        document.removeEventListener(
          "keydown",
          handleKeyDown,
        )
      }
    }, [isQuickActionsOpen])

    useEffect(() => {
      if (!actionMessage) {
        return
      }

      const timeoutId = window.setTimeout(
        () => {
          setActionMessage(null)
        },
        5000,
      )

      return () => {
        window.clearTimeout(timeoutId)
      }
    }, [actionMessage])

  async function handleAssignPreparer(
    preparerId: string | null,
  ) {
    setActionMessage(null)

    try {
      await assignTaxReturnPreparer(
        item.id,
        preparerId,
      )

      setIsAssignPreparerOpen(false)

      setActionMessageType("success")
      setActionMessage(
        preparerId
          ? "Preparer assigned successfully."
          : "Preparer assignment removed.",
      )

      onPriorityItemUpdated()
    } catch (error) {
      console.error(
        "Unable to assign preparer:",
        error,
      )

      setActionMessageType("error")

      setActionMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the preparer assignment.",
      )

      throw error
    }
  }

  const dueDateLabel =
    getDueDateLabel(
      item.daysUntilDue,
      item.dueDate,
    )

  const activityLabel =
    getActivityLabel(
      item.daysSinceActivity,
    )

  return (
  <>
    <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)] transition duration-200 hover:border-stone-300 hover:shadow-[0_16px_32px_-24px_rgba(15,23,42,0.4)] dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700">
      {actionMessage ? (
        <div
          role={
            actionMessageType === "error"
              ? "alert"
              : "status"
          }
          className={[
            "mb-4 rounded-lg border px-4 py-3",
            "text-sm font-medium",
            actionMessageType === "success"
              ? [
                  "border-green-200",
                  "bg-green-50",
                  "text-green-800",
                  "dark:border-green-900",
                  "dark:bg-green-950/40",
                  "dark:text-green-300",
                ].join(" ")
              : [
                  "border-red-200",
                  "bg-red-50",
                  "text-red-800",
                  "dark:border-red-900",
                  "dark:bg-red-950/40",
                  "dark:text-red-300",
                ].join(" "),
          ].join(" ")}
        >
          {actionMessage}
        </div>
      ) : null}
      
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <RiskScoreIndicator
          score={item.riskScore}
          level={item.riskLevel}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-semibold tracking-tight text-stone-950 dark:text-stone-50">
                  {item.clientName}
                </h3>

                <RiskLevelBadge
                  level={item.riskLevel}
                />
              </div>

              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                {item.taxYear}{" "}
                {item.returnType}
              </p>

              <p className="mt-1.5 text-sm font-semibold text-stone-900 dark:text-stone-100">
                {item.recommendedAction}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                to={getClientDetailsRoute(
                  item.clientId,
                )}
                onClick={() =>
                  setIsQuickActionsOpen(false)
                }
                className={[
                  "inline-flex items-center justify-center rounded-md",
                  "border border-stone-300 bg-white px-3 py-2",
                  "text-sm font-semibold text-stone-700",
                  "transition hover:bg-stone-100",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-stone-400",
                  "dark:border-stone-700",
                  "dark:bg-stone-900",
                  "dark:text-stone-200",
                  "dark:hover:bg-stone-800",
                ].join(" ")}
              >
                Open Client
              </Link>

              <Link
                to={item.actionRoute}
                onClick={() =>
                  setIsQuickActionsOpen(false)
                }
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-md bg-stone-900 px-3 py-2",
                  "text-sm font-semibold text-white",
                  "transition hover:bg-stone-700",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-stone-400",
                  "dark:bg-stone-100",
                  "dark:text-stone-900",
                  "dark:hover:bg-stone-300",
                ].join(" ")}
              >
                Open Return

                <ExternalLink
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

              <div
                ref={quickActionsContainerRef}
                className="relative"
              >
                <button
                  ref={quickActionsButtonRef}
                  type="button"
                  onClick={() =>
                    setIsQuickActionsOpen(
                      (currentValue) =>
                        !currentValue,
                    )
                  }
                  className={[
                    "inline-flex h-10 w-10 items-center justify-center",
                    "rounded-md border border-stone-300 bg-white",
                    "text-stone-700 transition hover:bg-stone-100",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-stone-400",
                    "dark:border-stone-700",
                    "dark:bg-stone-900",
                    "dark:text-stone-200",
                    "dark:hover:bg-stone-800",
                  ].join(" ")}
                  aria-expanded={isQuickActionsOpen}
                  aria-haspopup="menu"
                  aria-controls={`priority-actions-${item.id}`}
                  aria-label={`Quick actions for ${item.clientName}`}
                  title="Quick actions"
                >
                  <MoreHorizontal
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>

                {isQuickActionsOpen ? (
                  <div
                    id={`priority-actions-${item.id}`}
                    role="menu"
                    className={[
                      "absolute right-0 z-20 mt-2 w-64",
                      "rounded-xl border border-stone-200",
                      "bg-white p-2 shadow-xl",
                      "dark:border-stone-700",
                      "dark:bg-stone-900",
                    ].join(" ")}
                  >
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Quick Actions
                    </p>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsQuickActionsOpen(false)
                        setIsAssignPreparerOpen(true)
                      }}
                      className={[
                        "flex w-full items-center rounded-md",
                        "px-3 py-2 text-left text-sm",
                        "font-medium text-stone-700",
                        "transition hover:bg-stone-100",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-stone-400",
                        "dark:text-stone-200",
                        "dark:hover:bg-stone-800",
                      ].join(" ")}
                    >
                      Assign Preparer
                    </button>

                    {[
                      "Assign Reviewer",
                      "Mark Documents Received",
                      "Request Documents",
                      "Add Internal Note",
                      "Record Payment",
                    ].map((actionLabel) => (
                      <button
                        key={actionLabel}
                        type="button"
                        disabled
                        role="menuitem"
                        title={`${actionLabel} will be available in a later phase.`}
                        className={[
                          "flex w-full items-center rounded-md",
                          "px-3 py-2 text-left text-sm",
                          "font-medium text-stone-400",
                          "cursor-not-allowed",
                          "dark:text-stone-600",
                        ].join(" ")}
                      >
                        {actionLabel}
                      </button>
                    ))}

                    <div className="my-2 border-t border-stone-200 dark:border-stone-700" />

                    <p className="px-3 py-2 text-xs text-stone-500 dark:text-stone-400">
                      Workflow actions will be enabled in upcoming phases.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 dark:text-stone-400">
                Readiness
              </span>

              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {Math.round(
                  item.readinessScore,
                )}
                %
              </span>
            </div>

            <span
              className="hidden h-4 w-px bg-stone-200 sm:block dark:bg-stone-700"
              aria-hidden="true"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 dark:text-stone-400">
                Due
              </span>

              <span
                className={[
                  "font-semibold",
                  item.daysUntilDue !== null &&
                  item.daysUntilDue < 0
                    ? "text-red-700 dark:text-red-300"
                    : "text-stone-900 dark:text-stone-100",
                ].join(" ")}
              >
                {dueDateLabel}
              </span>
            </div>

            <span
              className="hidden h-4 w-px bg-stone-200 sm:block dark:bg-stone-700"
              aria-hidden="true"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 dark:text-stone-400">
                Outstanding
              </span>

              <span
                className={[
                  "font-semibold",
                  item.outstandingBalance > 0
                    ? "text-red-700 dark:text-red-300"
                    : "text-stone-900 dark:text-stone-100",
                ].join(" ")}
              >
                {formatCurrency(
                  item.outstandingBalance,
                )}
              </span>
            </div>

            <span
              className="hidden h-4 w-px bg-stone-200 sm:block dark:bg-stone-700"
              aria-hidden="true"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 dark:text-stone-400">
                Activity
              </span>

              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {activityLabel}
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
            <span>
              Preparer:{" "}
              <strong className="font-medium text-stone-700 dark:text-stone-300">
                {item.assignedPreparerName?.trim() ||
                  "Unassigned"}
              </strong>
            </span>

            <span>
              Reviewer:{" "}
              <strong className="font-medium text-stone-700 dark:text-stone-300">
                {item.assignedReviewerName?.trim() ||
                  "Unassigned"}
              </strong>
            </span>
          </div>

          <div className="mt-3 border-t border-stone-200 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() =>
                setIsExpanded(
                  (currentValue) =>
                    !currentValue,
                )
              }
              className={[
                "inline-flex items-center gap-2",
                "text-sm font-semibold text-stone-700",
                "transition hover:text-stone-950",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-stone-400",
                "dark:text-stone-300 dark:hover:text-white",
              ].join(" ")}
              aria-expanded={isExpanded}
            >
              {isExpanded
                ? "Hide risk factors"
                : `View risk factors (${item.riskFactors.length})`}

              {isExpanded ? (
                <ChevronUp
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </button>

            {isExpanded ? (
              <div className="mt-3">
                <RiskFactorList
                  factors={
                    item.riskFactors
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
            </article>

    <AssignPreparerDialog
  isOpen={isAssignPreparerOpen}
  clientName={item.clientName}
  taxYear={item.taxYear}
  returnType={item.returnType}
  currentPreparerId={null}
  onCancel={() =>
    setIsAssignPreparerOpen(false)
  }
  onAssign={
    handleAssignPreparer
  }
/> 
</>
  )
}