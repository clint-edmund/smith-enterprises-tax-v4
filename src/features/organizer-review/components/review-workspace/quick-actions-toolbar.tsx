import {
  CheckCircle2,
  RotateCcw,
  TriangleAlert,
} from "lucide-react"

import {
  QuickActionButton,
} from "@/features/organizer-review/components/review-workspace/quick-action-button"

import type {
  ReviewActionKey,
} from "@/features/organizer-review/types/review-action.types"

import type {
  ReviewStatus,
} from "@/features/organizer-review/types/review-metadata.types"

interface QuickActionsToolbarProps {
  status: ReviewStatus
  isBusy?: boolean
  canMarkReviewed?: boolean
  markReviewedDisabledReason?: string
  onSelectAction: (
    action:
      ReviewActionKey,
  ) => void
}

export function QuickActionsToolbar({
  status,
  isBusy = false,
  canMarkReviewed = true,
  markReviewedDisabledReason,
  onSelectAction,
}: QuickActionsToolbarProps) {
  const markReviewedDisabled =
    isBusy ||
    status ===
      "reviewed" ||
    !canMarkReviewed

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Review Workspace
        </p>

        <h4 className="mt-1 text-base font-semibold text-slate-950">
          Quick Actions
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Every action requires an explanation and is recorded in the review
          timeline.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <QuickActionButton
          label="Mark Reviewed"
          description="Complete this review item and record the final reviewer."
          icon={
            CheckCircle2
          }
          tone="success"
          disabled={
            markReviewedDisabled
          }
          disabledReason={
            status ===
              "reviewed"
              ? "This item is already reviewed."
              : !canMarkReviewed
                ? markReviewedDisabledReason ??
                  "Complete every required checklist item first."
                : "A review action is currently processing."
          }
          onClick={() => {
            onSelectAction(
              "mark_reviewed",
            )
          }}
        />

        <QuickActionButton
          label="Needs Follow-up"
          description="Flag this item for additional staff investigation."
          icon={
            TriangleAlert
          }
          tone="warning"
          disabled={
            isBusy ||
            status ===
              "needs_follow_up"
          }
          disabledReason={
            status ===
              "needs_follow_up"
              ? "This item already needs follow-up."
              : "A review action is currently processing."
          }
          onClick={() => {
            onSelectAction(
              "needs_follow_up",
            )
          }}
        />

        <QuickActionButton
          label="Return to Client"
          description="Reopen the Dependents section for client correction."
          icon={
            RotateCcw
          }
          tone="danger"
          disabled={
            isBusy ||
            status ===
              "returned_to_client"
          }
          disabledReason={
            status ===
              "returned_to_client"
              ? "This item is already waiting on the client."
              : "A review action is currently processing."
          }
          onClick={() => {
            onSelectAction(
              "return_to_client",
            )
          }}
        />
      </div>
    </section>
  )
}
