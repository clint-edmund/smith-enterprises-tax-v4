import type { Json } from "@/types/database.types"

import type {
  ReturnWorkflowEventType,
} from "./return-workflow.types"

export interface ReturnWorkflowHistoryItem {
  id: string

  taxReturnId: string

  clientId: string

  eventType: ReturnWorkflowEventType

  eventLabel: string

  eventDescription: string | null

  eventData: Json

  actorUserId: string | null

  actorName: string

  occurredAt: string

  createdAt: string

  isClientVisible: boolean
}