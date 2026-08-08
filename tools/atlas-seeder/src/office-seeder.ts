import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  createModulePlan,
} from "./config/module-plan"

import type {
  AtlasSeederOptions,
} from "./config/seeder-options"

import type {
  ModuleResult,
} from "./models/module-result"

import {
  runClientModule,
} from "./modules/client.module"

import {
  runDocumentCompletionModule,
} from "./modules/document-completion.module"

import {
  runOfficeActivityModule,
} from "./modules/office-activity.module"

import {
  runPaymentModule,
} from "./modules/payment.module"

import {
  runRequiredDocumentsModule,
} from "./modules/required-documents.module"

import {
  runReturnModule,
} from "./modules/return.module"

import {
  runStaffModule,
} from "./modules/staff.module"

import {
  developmentStaff,
} from "./staff"

import {
  printSeederSummary,
} from "./utils/seeder-summary"

import {
  Stopwatch,
} from "./utils/stopwatch"

export interface AtlasOfficeSeedResult {
  staffCount: number
  clientCount: number
  returnCount: number
  requiredDocumentCount: number
  completedDocumentCount: number
  officeActivityCount: number
  paymentCount: number
  administratorId: string | null
}

async function runTimedModule<T>(
  name: string,
  operation: () => Promise<T>,
  getCount: (result: T) => number,
): Promise<{
  result: T
  metric: ModuleResult
}> {
  const stopwatch =
    new Stopwatch()

  const result =
    await operation()

  const elapsedSeconds =
    Number(
      stopwatch.elapsedSeconds(),
    )

  const count =
    getCount(
      result,
    )

  console.log(
    `✓ ${name} completed in ${elapsedSeconds.toFixed(2)} sec`,
  )

  return {
    result,

    metric: {
      name,
      count,
      elapsedSeconds,
    },
  }
}

export async function seedAtlasOffice(
  supabase: SupabaseClient,
  options: AtlasSeederOptions,
): Promise<AtlasOfficeSeedResult> {
  const metrics: ModuleResult[] = []

  const modulePlan =
    new Set(
      createModulePlan(
        options,
      ),
    )

  console.log("")
  console.log(
    `Atlas Seeder Plan: ${[
      ...modulePlan,
    ].join(", ")}`,
  )
  console.log("")

  let administratorId:
    string | null =
      null

  let staffCount = 0
  let clientCount = 0
  let returnCount = 0
  let requiredDocumentCount = 0
  let completedDocumentCount = 0
  let officeActivityCount = 0
  let paymentCount = 0

  /*
   * Staff
   */
  if (
    modulePlan.has(
      "staff",
    )
  ) {
    const staffRun =
      await runTimedModule(
        "Staff",
        () =>
          runStaffModule(
            supabase,
          ),
        () =>
          developmentStaff.length,
      )

    metrics.push(
      staffRun.metric,
    )

    administratorId =
      staffRun.result
        .administrator
        .id

    staffCount =
      developmentStaff.length
  } else {
    console.log(
      "⏭ Staff skipped",
    )
  }

  /*
   * All modules after Staff require
   * the seeded administrator.
   */
  if (
    (
      modulePlan.has(
        "clients",
      ) ||
      modulePlan.has(
        "returns",
      ) ||
      modulePlan.has(
        "documents",
      ) ||
      modulePlan.has(
        "workflow",
      ) ||
      modulePlan.has(
        "payments",
      )
    ) &&
    !administratorId
  ) {
    throw new Error(
      "Atlas Seeder could not resolve the development administrator.",
    )
  }

  /*
   * Clients
   */
  if (
    modulePlan.has(
      "clients",
    )
  ) {
    const clientRun =
      await runTimedModule(
        "Clients",
        () =>
          runClientModule(
            supabase,
            administratorId!,
          ),
        (clients) =>
          clients.length,
      )

    metrics.push(
      clientRun.metric,
    )

    clientCount =
      clientRun.result.length
  } else {
    console.log(
      "⏭ Clients skipped",
    )
  }

  /*
   * Returns
   */
  if (
    modulePlan.has(
      "returns",
    )
  ) {
    const returnRun =
      await runTimedModule(
        "Returns",
        () =>
          runReturnModule(
            supabase,
            administratorId!,
          ),
        (returns) =>
          returns.length,
      )

    metrics.push(
      returnRun.metric,
    )

    returnCount =
      returnRun.result.length
  } else {
    console.log(
      "⏭ Returns skipped",
    )
  }

  /*
   * Required Documents +
   * Completion Simulation
   */
  if (
    modulePlan.has(
      "documents",
    )
  ) {
    const requiredDocumentsRun =
      await runTimedModule(
        "Required Documents",
        () =>
          runRequiredDocumentsModule(),
        (count) =>
          count,
      )

    metrics.push(
      requiredDocumentsRun.metric,
    )

    requiredDocumentCount =
      requiredDocumentsRun.result

    const documentCompletionRun =
      await runTimedModule(
        "Completed Documents",
        () =>
          runDocumentCompletionModule(),
        (count) =>
          count,
      )

    metrics.push(
      documentCompletionRun.metric,
    )

    completedDocumentCount =
      documentCompletionRun.result
  } else {
    console.log(
      "⏭ Required Documents skipped",
    )

    console.log(
      "⏭ Document Completion skipped",
    )
  }

  /*
   * Workflow / Office Activity
   */
  if (
    modulePlan.has(
      "workflow",
    )
  ) {
    const officeActivityRun =
      await runTimedModule(
        "Workflow Events",
        () =>
          runOfficeActivityModule(),
        (count) =>
          count,
      )

    metrics.push(
      officeActivityRun.metric,
    )

    officeActivityCount =
      officeActivityRun.result
  } else {
    console.log(
      "⏭ Workflow Events skipped",
    )
  }

  /*
   * Payments
   */
  if (
    modulePlan.has(
      "payments",
    )
  ) {
    const paymentRun =
      await runTimedModule(
        "Payments",
        () =>
          runPaymentModule(),
        (payments) =>
          payments.length,
      )

    metrics.push(
      paymentRun.metric,
    )

    paymentCount =
      paymentRun.result.length
  } else {
    console.log(
      "⏭ Payments skipped",
    )
  }

  printSeederSummary(
    metrics,
  )

  return {
    staffCount,

    clientCount,

    returnCount,

    requiredDocumentCount,

    completedDocumentCount,

    officeActivityCount,

    paymentCount,

    administratorId,
  }
}