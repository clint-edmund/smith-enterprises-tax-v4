import {
  useEffect,
  useState,
} from "react"

import {
  getWorkflowStatusOption,
} from "../constants/workflow-statuses"

import {
  useUpdateWorkflow,
} from "../hooks/use-update-workflow"

import type {
  WorkflowStatus,
} from "../types/workflow.types"

import {
  WorkflowStatusBadge,
} from "./workflow-status-badge"

import {
  WorkflowStatusSelect,
} from "./workflow-status-select"

interface ReturnWorkflowPanelProps {
  returnId: string
  workflowStatus:
    | WorkflowStatus
    | null
  holdReason?: string | null
  statusChangedAt?: string | null
  onWorkflowUpdated?: () => void
}

export function ReturnWorkflowPanel({
  returnId,
  workflowStatus,
  holdReason,
  statusChangedAt,
  onWorkflowUpdated,
}: ReturnWorkflowPanelProps) {
  const currentStatus =
    workflowStatus ?? "intake"

  const [selectedStatus, setSelectedStatus] =
    useState<WorkflowStatus>(
      currentStatus,
    )

  const [nextHoldReason, setNextHoldReason] =
    useState(
      holdReason ?? "",
    )

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  const {
    isUpdating,
    error,
    updateWorkflow,
    clearError,
  } = useUpdateWorkflow()

  useEffect(() => {
    setSelectedStatus(currentStatus)
  }, [currentStatus])

  useEffect(() => {
    setNextHoldReason(
      holdReason ?? "",
    )
  }, [holdReason])

  const selectedOption =
    getWorkflowStatusOption(
      selectedStatus,
    )

  const hasStatusChanged =
    selectedStatus !== currentStatus

  const hasHoldReasonChanged =
    selectedStatus === "on_hold" &&
    nextHoldReason.trim() !==
      (holdReason ?? "").trim()

  const hasChanges =
    hasStatusChanged ||
    hasHoldReasonChanged

  const handleStatusChange = (
    status: WorkflowStatus,
  ) => {
    clearError()
    setSuccessMessage(null)
    setSelectedStatus(status)

    if (status !== "on_hold") {
      setNextHoldReason("")
    }
  }

  const handleSave = async () => {
    clearError()
    setSuccessMessage(null)

    const normalizedHoldReason =
      nextHoldReason.trim()

    if (
      selectedStatus === "on_hold" &&
      !normalizedHoldReason
    ) {
      return
    }

    await updateWorkflow(
      returnId,
      {
        workflowStatus:
          selectedStatus,

        holdReason:
          selectedStatus === "on_hold"
            ? normalizedHoldReason
            : null,
      },
    )

    setSuccessMessage(
      `Workflow updated to ${selectedOption.label}.`,
    )

    onWorkflowUpdated?.()
  }

  const handleCancel = () => {
    clearError()
    setSuccessMessage(null)
    setSelectedStatus(currentStatus)
    setNextHoldReason(
      holdReason ?? "",
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Office Workflow
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Return Status
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Track this return through the
            office preparation process.
          </p>
        </div>

        <WorkflowStatusBadge
          status={currentStatus}
        />
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label
            htmlFor="workflow-status"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Workflow status
          </label>

          <WorkflowStatusSelect
            id="workflow-status"
            value={selectedStatus}
            onChange={
              handleStatusChange
            }
            disabled={isUpdating}
          />
        </div>

        {selectedStatus ===
          "on_hold" && (
          <div>
            <label
              htmlFor="workflow-hold-reason"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Hold reason
            </label>

            <textarea
              id="workflow-hold-reason"
              value={nextHoldReason}
              onChange={(event) => {
                clearError()
                setSuccessMessage(null)
                setNextHoldReason(
                  event.target.value,
                )
              }}
              rows={4}
              maxLength={1000}
              disabled={isUpdating}
              placeholder="Explain why this return is on hold."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>
                Required when placing a
                return on hold.
              </span>

              <span>
                {nextHoldReason.length}
                /1000
              </span>
            </div>
          </div>
        )}

        {statusChangedAt && (
          <p className="text-sm text-slate-500">
            Last workflow change:{" "}
            {new Intl.DateTimeFormat(
              undefined,
              {
                dateStyle: "medium",
                timeStyle: "short",
              },
            ).format(
              new Date(
                statusChangedAt,
              ),
            )}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {successMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isUpdating ||
              !hasChanges ||
              (
                selectedStatus ===
                  "on_hold" &&
                !nextHoldReason.trim()
              )
            }
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isUpdating
              ? "Saving..."
              : "Save Workflow"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={
              isUpdating ||
              !hasChanges
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
}