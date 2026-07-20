import type {
  ReturnStatus,
} from "@/features/returns/types/return.types"
import {
  returnStatusLabels,
} from "@/features/returns/utils/return-formatters"

export interface WorkflowStep {
  status: ReturnStatus
  label: string
  description: string
}

export const standardReturnWorkflow:
  WorkflowStep[] = [
    {
      status: "not_started",
      label: "Intake",
      description:
        "The return has been created and entered into the intake process.",
    },
    {
      status: "documents_pending",
      label: "Documents Pending",
      description:
        "Required client documents are still outstanding.",
    },
    {
      status: "in_progress",
      label: "In Progress",
      description:
        "The preparer is actively working on the return.",
    },
    {
      status: "ready_for_review",
      label: "Ready for Review",
      description:
        "Preparation is complete and awaiting review.",
    },
    {
      status: "under_review",
      label: "Under Review",
      description:
        "A reviewer is checking the return.",
    },
    {
      status: "ready_to_file",
      label: "Ready to File",
      description:
        "The return is approved and ready for submission.",
    },
    {
      status: "filed",
      label: "Filed",
      description:
        "The return has been submitted.",
    },
    {
      status: "accepted",
      label: "Accepted",
      description:
        "The taxing authority accepted the filing.",
    },
    {
      status: "completed",
      label: "Completed",
      description:
        "All return work is complete.",
    },
  ]

const allowedTransitions: Record<
  ReturnStatus,
  ReturnStatus[]
> = {
  not_started: [
    "not_started",
    "documents_pending",
    "in_progress",
    "on_hold",
  ],

  documents_pending: [
    "documents_pending",
    "not_started",
    "in_progress",
    "on_hold",
  ],

  in_progress: [
    "in_progress",
    "documents_pending",
    "ready_for_review",
    "on_hold",
  ],

  ready_for_review: [
    "ready_for_review",
    "in_progress",
    "under_review",
    "on_hold",
  ],

  under_review: [
    "under_review",
    "in_progress",
    "ready_for_review",
    "ready_to_file",
    "on_hold",
  ],

  ready_to_file: [
    "ready_to_file",
    "under_review",
    "filed",
    "on_hold",
  ],

  filed: [
    "filed",
    "accepted",
    "rejected",
    "ready_to_file",
    "on_hold",
  ],

  accepted: [
    "accepted",
    "completed",
    "rejected",
  ],

  rejected: [
    "rejected",
    "in_progress",
    "ready_for_review",
    "ready_to_file",
    "filed",
    "on_hold",
  ],

  completed: [
    "completed",
    "accepted",
    "in_progress",
  ],

  on_hold: [
    "on_hold",
    "documents_pending",
    "in_progress",
    "ready_for_review",
    "under_review",
    "ready_to_file",
    "filed",
  ],
}

const createStatuses: ReturnStatus[] = [
  "not_started",
  "documents_pending",
  "in_progress",
  "on_hold",
]

export interface ReturnStatusOption {
  value: ReturnStatus
  label: string
}

export function getAllowedReturnStatuses(
  currentStatus?: ReturnStatus,
): ReturnStatusOption[] {
  const statuses = currentStatus
    ? allowedTransitions[currentStatus]
    : createStatuses

  return statuses.map((status) => ({
    value: status,
    label: returnStatusLabels[status],
  }))
}

export function isValidReturnStatusTransition(
  currentStatus: ReturnStatus,
  requestedStatus: ReturnStatus,
): boolean {
  return allowedTransitions[
    currentStatus
  ].includes(requestedStatus)
}

export function getWorkflowStepIndex(
  status: ReturnStatus,
): number {
  if (status === "rejected") {
    return standardReturnWorkflow.findIndex(
      (step) =>
        step.status === "filed",
    )
  }

  if (status === "on_hold") {
    return standardReturnWorkflow.findIndex(
      (step) =>
        step.status === "in_progress",
    )
  }

  return standardReturnWorkflow.findIndex(
    (step) => step.status === status,
  )
}