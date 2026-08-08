export type OrganizerReviewTimelineSectionKey =
  | "income"
  | "dependents"
  | "healthcare"
  | "deductions"
  | "credits"
  | "business"
  | "investments"
  | "final_review"

export type OrganizerReviewTimelineSubjectType =
  | "income_source"
  | "dependent"
  | "healthcare_record"
  | "deduction"
  | "credit"
  | "business_record"
  | "investment_record"
  | "organizer"

export type OrganizerReviewTimelineEventType =
  | "staff_note"
  | "marked_reviewed"
  | "needs_follow_up"
  | "returned_to_client"
  | "resubmitted"
  | "status_changed"

export interface OrganizerReviewTimelineEntry {
  entryId: string
  organizerId: string
  sectionKey:
    OrganizerReviewTimelineSectionKey
  subjectType:
    OrganizerReviewTimelineSubjectType
  subjectId: string
  eventType:
    OrganizerReviewTimelineEventType
  noteText: string | null
  actorId: string | null
  actorName: string
  metadata:
    Record<string, unknown>
  createdAt: string
}

export interface GetOrganizerReviewTimelineRequest {
  organizerId: string
  subjectType:
    OrganizerReviewTimelineSubjectType
  subjectId: string
}

export interface AddOrganizerReviewStaffNoteRequest {
  organizerId: string
  sectionKey:
    OrganizerReviewTimelineSectionKey
  subjectType:
    OrganizerReviewTimelineSubjectType
  subjectId: string
  noteText: string
}
