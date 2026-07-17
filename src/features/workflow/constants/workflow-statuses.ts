import type {
  WorkflowStatus,
  WorkflowStatusOption,
} from "../types/workflow.types"

export const workflowStatusOptions: WorkflowStatusOption[] = [
  {
    value: "intake",
    label: "Intake",
    description:
      "The return has been created and intake information is being collected.",
    order: 1,
  },
  {
    value: "documents_pending",
    label: "Documents Pending",
    description:
      "Required client documents are still outstanding.",
    order: 2,
  },
  {
    value: "ready_for_preparation",
    label: "Ready for Preparation",
    description:
      "The return has the required information and can be assigned for preparation.",
    order: 3,
  },
  {
    value: "in_preparation",
    label: "In Preparation",
    description:
      "A preparer is actively preparing the tax return.",
    order: 4,
  },
  {
    value: "review",
    label: "Review",
    description:
      "The prepared return is awaiting quality review.",
    order: 5,
  },
  {
    value: "signature_pending",
    label: "Signature Pending",
    description:
      "The return is awaiting client signatures or authorization.",
    order: 6,
  },
  {
    value: "ready_to_file",
    label: "Ready to File",
    description:
      "The return has been approved and is ready for electronic filing.",
    order: 7,
  },
  {
    value: "filed",
    label: "Filed",
    description:
      "The return has been submitted to the applicable tax authority.",
    order: 8,
  },
  {
    value: "completed",
    label: "Completed",
    description:
      "The return workflow has been completed.",
    order: 9,
  },
  {
    value: "on_hold",
    label: "On Hold",
    description:
      "The return is temporarily paused and requires staff attention.",
    order: 10,
  },
]

export const workflowStatusLabels: Record<
  WorkflowStatus,
  string
> = {
  intake: "Intake",
  documents_pending: "Documents Pending",
  ready_for_preparation: "Ready for Preparation",
  in_preparation: "In Preparation",
  review: "Review",
  signature_pending: "Signature Pending",
  ready_to_file: "Ready to File",
  filed: "Filed",
  completed: "Completed",
  on_hold: "On Hold",
}

export function getWorkflowStatusOption(
  status: WorkflowStatus,
): WorkflowStatusOption {
  const option = workflowStatusOptions.find(
    (item) => item.value === status,
  )

  if (!option) {
    throw new Error(
      `Unsupported workflow status: ${status}`,
    )
  }

  return option
}