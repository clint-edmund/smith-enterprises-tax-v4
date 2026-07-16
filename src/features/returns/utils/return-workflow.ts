import type {
  ReturnStatus,
} from "@/features/returns/types/return.types"

export interface WorkflowStep {
  status: ReturnStatus
  label: string
  description: string
}

export const standardReturnWorkflow:
  WorkflowStep[] = [
    {
      status: "not_started",
      label: "Not Started",
      description:
        "The return record has been created.",
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