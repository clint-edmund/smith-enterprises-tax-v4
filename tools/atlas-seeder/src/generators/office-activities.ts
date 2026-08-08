import type {
  GeneratedOfficeActivity,
} from "../models/generated-office-activity"

import type {
  GeneratedReturn,
} from "../models/generated-return"

import {
  generateReturns,
} from "./returns"

import {
  simulationDateOffset,
} from "../simulation/clock"

function createSimulationKey(
  taxReturn: GeneratedReturn,
  eventType: string,
): string {
  return [
    taxReturn.clientNumber,
    taxReturn.taxYear,
    eventType,
  ].join(":")
}

function createActivity(
  taxReturn: GeneratedReturn,
  eventType: string,
  eventLabel: string,
  eventDescription: string,
  occurredAt: string,
  isClientVisible = true,
): GeneratedOfficeActivity {
  const simulationKey =
    createSimulationKey(
      taxReturn,
      eventType,
    )

  return {
    clientNumber:
      taxReturn.clientNumber,

    taxYear:
      taxReturn.taxYear,

    simulationKey,

    eventType,

    eventLabel,

    eventDescription,

    isClientVisible,

    occurredAt,

    eventData: {
      atlas_simulation: true,
      atlas_simulation_key:
        simulationKey,
      intelligence_profile:
        taxReturn.intelligenceProfile,
    },
  }
}

function createActivitiesForReturn(
  taxReturn: GeneratedReturn,
): GeneratedOfficeActivity[] {
  /*
   * Historical returns get a small completed
   * timeline rather than active-office events.
   */
  if (
    taxReturn.intelligenceProfile ===
    "historical"
  ) {
    return [
      createActivity(
        taxReturn,
        "historical_return_received",
        "Return received",
        "Prior-year tax return was received for preparation.",
        taxReturn.dateReceived
          ? `${taxReturn.dateReceived}T12:00:00.000Z`
          : taxReturn.createdAt,
      ),

      createActivity(
        taxReturn,
        "historical_return_completed",
        "Return completed",
        "Prior-year tax return was completed.",
        taxReturn.workflowCompletedAt ??
          taxReturn.updatedAt,
      ),
    ]
  }

  switch (
    taxReturn.intelligenceProfile
  ) {
    case "critical":
      return [
        createActivity(
          taxReturn,
          "documents_requested",
          "Documents requested",
          "Required tax documents were requested from the client.",
          simulationDateOffset(
            -25,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "client_follow_up",
          "Client follow-up",
          "The office followed up regarding outstanding tax documents.",
          simulationDateOffset(
            -18,
          ).toISOString(),
        ),
      ]

    case "high":
      return [
        createActivity(
          taxReturn,
          "documents_received",
          "Documents received",
          "Additional tax documents were received from the client.",
          simulationDateOffset(
            -5,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "review_requested",
          "Review requested",
          "Preparation was completed and the return is awaiting reviewer assignment.",
          simulationDateOffset(
            -2,
          ).toISOString(),
        ),
      ]

    case "medium":
      return [
        createActivity(
          taxReturn,
          "preparation_started",
          "Preparation started",
          "The assigned preparer began working on the return.",
          simulationDateOffset(
            -8,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "preparation_progress",
          "Preparation updated",
          "The preparer updated the return during active preparation.",
          simulationDateOffset(
            -4,
          ).toISOString(),
          false,
        ),
      ]

    case "low":
      return [
        createActivity(
          taxReturn,
          "documents_complete",
          "Documents complete",
          "Required client documents were received and reviewed.",
          simulationDateOffset(
            -3,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "ready_for_preparation",
          "Ready for preparation",
          "The return is ready for tax preparation.",
          simulationDateOffset(
            -1,
          ).toISOString(),
        ),
      ]

    case "review":
      return [
        createActivity(
          taxReturn,
          "documents_complete",
          "Documents complete",
          "Required documentation is complete.",
          simulationDateOffset(
            -4,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "review_started",
          "Review started",
          "The assigned reviewer began reviewing the prepared return.",
          simulationDateOffset(
            -2,
          ).toISOString(),
        ),
      ]

    case "on_hold":
      return [
        createActivity(
          taxReturn,
          "additional_information_requested",
          "Additional information requested",
          "Additional information was requested from the client.",
          simulationDateOffset(
            -12,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "return_placed_on_hold",
          "Return placed on hold",
          taxReturn.workflowHoldReason ??
            "The return was placed on hold pending additional information.",
          simulationDateOffset(
            -10,
          ).toISOString(),
        ),
      ]

    case "completed":
      return [
        createActivity(
          taxReturn,
          "review_completed",
          "Review completed",
          "Final review was completed successfully.",
          simulationDateOffset(
            -40,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "return_filed",
          "Return filed",
          "The completed tax return was filed.",
          simulationDateOffset(
            -37,
          ).toISOString(),
        ),

        createActivity(
          taxReturn,
          "return_completed",
          "Return completed",
          "The tax return workflow was completed.",
          simulationDateOffset(
            -35,
          ).toISOString(),
        ),
      ]
  }
}

export function generateOfficeActivities():
GeneratedOfficeActivity[] {
  const returns =
    generateReturns()

  return returns.flatMap(
    (taxReturn) =>
      createActivitiesForReturn(
        taxReturn,
      ),
  )
}