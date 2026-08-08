import {
  supabase,
} from "@/services/supabase"

import type {
  AddReviewWorkflowEventRequest,
} from "@/features/organizer-review/types/review-action.types"

function requireValue(
  value: string,
  label: string,
): string {
  const normalized =
    value.trim()

  if (!normalized) {
    throw new Error(
      `${label} is required.`,
    )
  }

  return normalized
}

export async function addReviewWorkflowEvent(
  request:
    AddReviewWorkflowEventRequest,
): Promise<void> {
  const organizerId =
    requireValue(
      request.organizerId,
      "An organizer identifier",
    )

  const subjectId =
    requireValue(
      request.subjectId,
      "A review subject identifier",
    )

  const explanation =
    requireValue(
      request.explanation,
      "A review explanation",
    )

  if (
    explanation.length >
    10000
  ) {
    throw new Error(
      "The review explanation cannot exceed 10,000 characters.",
    )
  }

  const {
    error,
  } = await supabase.rpc(
    "add_organizer_review_workflow_event",
    {
      requested_organizer_id:
        organizerId,

      requested_section_key:
        request.sectionKey,

      requested_subject_type:
        request.subjectType,

      requested_subject_id:
        subjectId,

      requested_event_type:
        request.eventType,

      requested_note_text:
        explanation,

      requested_metadata:
        request.metadata ?? {},
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}
