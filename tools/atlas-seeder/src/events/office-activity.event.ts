import type {
  GeneratedOfficeActivity,
} from "../models/generated-office-activity"

import {
  getReturnLookupKey,
} from "../workflow/return-lookup"

import type {
  WorkflowContext,
  WorkflowEvent,
} from "../workflow/types"

interface WorkflowHistoryRow {
  event_data:
    | Record<string, unknown>
    | null
}

export class OfficeActivityEvent
implements WorkflowEvent {
  readonly name: string

  constructor(
    private readonly activity:
      GeneratedOfficeActivity,
  ) {
    this.name =
      [
        "Activity",
        activity.clientNumber,
        activity.taxYear,
        activity.eventType,
      ].join(" ")
  }

  async execute(
    context: WorkflowContext,
  ): Promise<void> {
    const lookupKey =
      getReturnLookupKey(
        this.activity.clientNumber,
        this.activity.taxYear,
      )

    const returnId =
      context.returnIdsByClientYear.get(
        lookupKey,
      )

    if (!returnId) {
      throw new Error(
        `Unable to resolve tax return ${lookupKey}.`,
      )
    }

    /*
     * Use the production workflow-history RPC
     * rather than querying the protected table
     * directly.
     */
    const {
      data: workflowHistory,
      error: lookupError,
    } = await context.supabase.rpc(
      "get_return_workflow_history",
      {
        requested_return_id:
          returnId,
      },
    )

    if (lookupError) {
      throw new Error(
        [
          `Unable to check activity ${this.activity.simulationKey}.`,
          lookupError.message,
        ].join("\n"),
      )
    }

    const historyRows =
      (workflowHistory ?? []) as
        WorkflowHistoryRow[]

    const existingActivity =
      historyRows.some(
        (historyItem) => {
          const eventData =
            historyItem.event_data

          if (
            !eventData ||
            typeof eventData !== "object" ||
            Array.isArray(eventData)
          ) {
            return false
          }

          return (
            eventData.atlas_simulation_key ===
            this.activity.simulationKey
          )
        },
      )

    if (existingActivity) {
      console.log(
        `  ↻ Already recorded: ${this.activity.simulationKey}`,
      )

      return
    }

    const {
      error,
    } = await context.supabase.rpc(
      "log_return_workflow",
      {
        requested_return_id:
          returnId,

        requested_event_type:
          this.activity.eventType,

        requested_event_label:
          this.activity.eventLabel,

        requested_event_description:
          this.activity.eventDescription,

        requested_is_client_visible:
          this.activity.isClientVisible,

        requested_event_data:
          this.activity.eventData,

        requested_occurred_at:
          this.activity.occurredAt,
      },
    )

    if (error) {
      throw new Error(
        [
          `Activity workflow failed for ${lookupKey}.`,
          error.message,
        ].join("\n"),
      )
    }
  }
}