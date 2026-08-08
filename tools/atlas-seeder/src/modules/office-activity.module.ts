import {
  OfficeActivityEvent,
} from "../events/office-activity.event"

import {
  generateOfficeActivities,
} from "../generators/office-activities"

import {
  logHeader,
} from "../utils/logger"

import {
  createAuthenticatedWorkflowClient,
} from "../workflow/authenticated-client"

import {
  executeWorkflow,
} from "../workflow/executor"

import {
  loadReturnIdsByClientYear,
} from "../workflow/return-lookup"

export async function runOfficeActivityModule():
Promise<number> {
  logHeader(
    "Simulating Atlas Office Activity",
  )

  const workflowClient =
    await createAuthenticatedWorkflowClient()

  console.log(
    `✓ Authenticated workflow client: ${workflowClient.email}`,
  )

  const returnIdsByClientYear =
    await loadReturnIdsByClientYear(
      workflowClient.supabase,
    )

  console.log(
    `✓ Loaded ${returnIdsByClientYear.size} tax-return references`,
  )

  const activities =
    generateOfficeActivities()

  console.log(
    `✓ Prepared ${activities.length} office activity events`,
  )

  const events =
    activities.map(
      (activity) =>
        new OfficeActivityEvent(
          activity,
        ),
    )

  console.log("")

  await executeWorkflow(
    workflowClient.supabase,
    workflowClient.userId,
    returnIdsByClientYear,
    events,
  )

  console.log("")
  console.log(
    `✓ Processed ${activities.length} simulated workflow events`,
  )

  return activities.length
}