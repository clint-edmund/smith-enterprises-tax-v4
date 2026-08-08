import {
  supabase,
} from "@/services/supabase"

import type {
  AddOrganizerReviewStaffNoteRequest,
  GetOrganizerReviewTimelineRequest,
  OrganizerReviewTimelineEntry,
  OrganizerReviewTimelineEventType,
  OrganizerReviewTimelineSectionKey,
  OrganizerReviewTimelineSubjectType,
} from "@/features/organizer-review/types/organizer-review-timeline.types"

interface OrganizerReviewTimelineRow {
  entry_id: string
  organizer_id: string
  section_key: string
  subject_type: string
  subject_id: string
  event_type: string
  note_text:
    string | null
  actor_id:
    string | null
  actor_name: string
  metadata:
    Record<string, unknown> | null
  created_at: string
}

function normalizeRequiredId(
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

function normalizeRequiredText(
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

function normalizeNoteText(
  value: string,
): string {
  const normalized =
    normalizeRequiredText(
      value,
      "A staff note",
    )

  if (
    normalized.length >
    10000
  ) {
    throw new Error(
      "The staff note cannot exceed 10,000 characters.",
    )
  }

  return normalized
}

function mapSectionKey(
  value: string,
): OrganizerReviewTimelineSectionKey {
  switch (value) {
    case "income":
    case "dependents":
    case "healthcare":
    case "deductions":
    case "credits":
    case "business":
    case "investments":
    case "final_review":
      return value

    default:
      throw new Error(
        `Unsupported review timeline section: ${value}`,
      )
  }
}

function mapSubjectType(
  value: string,
): OrganizerReviewTimelineSubjectType {
  switch (value) {
    case "income_source":
    case "dependent":
    case "healthcare_record":
    case "deduction":
    case "credit":
    case "business_record":
    case "investment_record":
    case "organizer":
      return value

    default:
      throw new Error(
        `Unsupported review timeline subject type: ${value}`,
      )
  }
}

function mapEventType(
  value: string,
): OrganizerReviewTimelineEventType {
  switch (value) {
    case "staff_note":
    case "marked_reviewed":
    case "needs_follow_up":
    case "returned_to_client":
    case "resubmitted":
    case "status_changed":
      return value

    default:
      throw new Error(
        `Unsupported review timeline event type: ${value}`,
      )
  }
}

function mapEntry(
  row:
    OrganizerReviewTimelineRow,
): OrganizerReviewTimelineEntry {
  return {
    entryId:
      row.entry_id,

    organizerId:
      row.organizer_id,

    sectionKey:
      mapSectionKey(
        row.section_key,
      ),

    subjectType:
      mapSubjectType(
        row.subject_type,
      ),

    subjectId:
      row.subject_id,

    eventType:
      mapEventType(
        row.event_type,
      ),

    noteText:
      row.note_text,

    actorId:
      row.actor_id,

    actorName:
      row.actor_name,

    metadata:
      row.metadata ?? {},

    createdAt:
      row.created_at,
  }
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return "Unable to complete the review timeline request."
}

export async function getOrganizerReviewTimeline(
  request:
    GetOrganizerReviewTimelineRequest,
): Promise<OrganizerReviewTimelineEntry[]> {
  const organizerId =
    normalizeRequiredId(
      request.organizerId,
      "An organizer identifier",
    )

  const subjectId =
    normalizeRequiredId(
      request.subjectId,
      "A timeline subject identifier",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_organizer_review_timeline",
    {
      requested_organizer_id:
        organizerId,

      requested_subject_type:
        request.subjectType,

      requested_subject_id:
        subjectId,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
      ),
    )
  }

  return (
    (
      data as
        | OrganizerReviewTimelineRow[]
        | null
    ) ?? []
  ).map(
    mapEntry,
  )
}

export async function addOrganizerReviewStaffNote(
  request:
    AddOrganizerReviewStaffNoteRequest,
): Promise<OrganizerReviewTimelineEntry> {
  const organizerId =
    normalizeRequiredId(
      request.organizerId,
      "An organizer identifier",
    )

  const subjectId =
    normalizeRequiredId(
      request.subjectId,
      "A timeline subject identifier",
    )

  const noteText =
    normalizeNoteText(
      request.noteText,
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "add_organizer_review_staff_note",
    {
      requested_organizer_id:
        organizerId,

      requested_section_key:
        request.sectionKey,

      requested_subject_type:
        request.subjectType,

      requested_subject_id:
        subjectId,

      requested_note_text:
        noteText,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
      ),
    )
  }

  const row =
    (
      data as
        | OrganizerReviewTimelineRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The saved timeline entry was not returned.",
    )
  }

  return mapEntry(
    row,
  )
}
