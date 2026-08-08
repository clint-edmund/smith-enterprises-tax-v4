import type {
  AtlasIntelligenceProfile,
} from "../models/generated-return"

export interface IntelligenceProfileDefinition {
  profile: AtlasIntelligenceProfile

  status:
    | "not_started"
    | "documents_pending"
    | "in_progress"
    | "ready_for_review"
    | "under_review"
    | "ready_to_file"
    | "filed"
    | "accepted"
    | "rejected"
    | "completed"
    | "on_hold"

  workflowStatus:
    | "intake"
    | "documents_pending"
    | "ready_for_preparation"
    | "in_preparation"
    | "review"
    | "signature_pending"
    | "ready_to_file"
    | "filed"
    | "completed"
    | "on_hold"

  dueOffsetDays: number

  assignPreparer: boolean
  assignReviewer: boolean

  holdReason: string | null
}

const activeProfileDefinitions: readonly IntelligenceProfileDefinition[] = [
  {
    profile: "critical",
    status: "documents_pending",
    workflowStatus: "documents_pending",
    dueOffsetDays: -10,
    assignPreparer: false,
    assignReviewer: false,
    holdReason: null,
  },

  {
    profile: "high",
    status: "ready_for_review",
    workflowStatus: "review",
    dueOffsetDays: 2,
    assignPreparer: true,
    assignReviewer: false,
    holdReason: null,
  },

  {
    profile: "medium",
    status: "in_progress",
    workflowStatus: "in_preparation",
    dueOffsetDays: 10,
    assignPreparer: true,
    assignReviewer: false,
    holdReason: null,
  },

  {
    profile: "low",
    status: "in_progress",
    workflowStatus: "ready_for_preparation",
    dueOffsetDays: 35,
    assignPreparer: true,
    assignReviewer: false,
    holdReason: null,
  },

  {
    profile: "review",
    status: "under_review",
    workflowStatus: "review",
    dueOffsetDays: 5,
    assignPreparer: true,
    assignReviewer: true,
    holdReason: null,
  },

  {
    profile: "on_hold",
    status: "on_hold",
    workflowStatus: "on_hold",
    dueOffsetDays: -3,
    assignPreparer: true,
    assignReviewer: false,
    holdReason:
      "Waiting on additional client information.",
  },

  {
    profile: "completed",
    status: "completed",
    workflowStatus: "completed",
    dueOffsetDays: -45,
    assignPreparer: true,
    assignReviewer: true,
    holdReason: null,
  },
] as const

export function getIntelligenceProfile(
  clientPosition: number,
  taxYear: number,
): IntelligenceProfileDefinition {
  /*
   * Prior-year returns represent historical work.
   */
  if (taxYear <= 2024) {
    return {
      profile: "historical",
      status: "completed",
      workflowStatus: "completed",
      dueOffsetDays: -365,
      assignPreparer: true,
      assignReviewer: true,
      holdReason: null,
    }
  }

  /*
   * 2025 return distribution across 125 clients:
   *
   * Critical   10
   * High       20
   * Medium     30
   * Low        25
   * Review     15
   * On Hold    10
   * Completed  15
   */
  if (clientPosition <= 10) {
    return activeProfileDefinitions[0]
  }

  if (clientPosition <= 30) {
    return activeProfileDefinitions[1]
  }

  if (clientPosition <= 60) {
    return activeProfileDefinitions[2]
  }

  if (clientPosition <= 85) {
    return activeProfileDefinitions[3]
  }

  if (clientPosition <= 100) {
    return activeProfileDefinitions[4]
  }

  if (clientPosition <= 110) {
    return activeProfileDefinitions[5]
  }

  return activeProfileDefinitions[6]
}