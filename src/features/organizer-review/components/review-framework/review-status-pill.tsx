import {
  ReviewStatusBadge,
} from "@/features/organizer-review/components/review-status-badge"

export type SharedReviewStatus =
  | "pending"
  | "reviewed"
  | "needs_follow_up"
  | "returned_to_client"

interface ReviewStatusPillProps {
  status:
    SharedReviewStatus
  reviewedByName?:
    string | null
}

const labels:
  Record<
    SharedReviewStatus,
    string
  > = {
    pending:
      "Pending Review",

    reviewed:
      "Reviewed",

    needs_follow_up:
      "Needs Follow-up",

    returned_to_client:
      "Returned to Client",
  }

function getBadgeStatus(
  status:
    SharedReviewStatus,
) {
  if (status === "reviewed") {
    return "complete" as const
  }

  if (
    status === "needs_follow_up" ||
    status === "returned_to_client"
  ) {
    return "needs_attention" as const
  }

  return "in_progress" as const
}

export function ReviewStatusPill({
  status,
  reviewedByName = null,
}: ReviewStatusPillProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ReviewStatusBadge
        status={
          getBadgeStatus(
            status,
          )
        }
        label={
          labels[
            status
          ]
        }
      />

      {reviewedByName && (
        <span className="text-xs text-slate-500">
          by{" "}
          {
            reviewedByName
          }
        </span>
      )}
    </div>
  )
}
