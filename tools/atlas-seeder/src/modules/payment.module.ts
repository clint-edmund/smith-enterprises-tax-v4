import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  createPaymentEvents,
} from "../events/payment-events"

import {
  generatePayments,
} from "../generators/payments"

import type {
  GeneratedPayment,
} from "../models/generated-payment"

import {
  createAuthenticatedWorkflowClient,
} from "../workflow/authenticated-client"

import {
  executeWorkflow,
} from "../workflow/executor"

import {
  loadReturnIdsByClientYear,
} from "../workflow/return-lookup"

import {
  logHeader,
} from "../utils/logger"

async function verifyPayments(
  supabase: SupabaseClient,
  expectedCount: number,
): Promise<void> {
  const {
    count,
    error,
  } = await supabase
    .from("payments")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .like(
      "reference_number",
      "ATLAS-%",
    )

  if (error) {
    throw new Error(
      [
        "Unable to verify Atlas development payments.",
        error.message,
      ].join("\n"),
    )
  }

  if (
    count !== expectedCount
  ) {
    throw new Error(
      [
        "Development payment verification failed.",
        `Expected: ${expectedCount}`,
        `Found: ${count ?? 0}`,
      ].join("\n"),
    )
  }

  console.log(
    `✓ Verified ${expectedCount} development payments`,
  )
}

async function verifyReceipts(
  supabase: SupabaseClient,
  expectedCount: number,
): Promise<void> {
  const {
    count,
    error,
  } = await supabase
    .from("payments")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .like(
      "reference_number",
      "ATLAS-%",
    )
    .not(
      "receipt_number",
      "is",
      null,
    )

  if (error) {
    throw new Error(
      [
        "Unable to verify Atlas payment receipts.",
        error.message,
      ].join("\n"),
    )
  }

  if (
    count !== expectedCount
  ) {
    throw new Error(
      [
        "Development receipt verification failed.",
        `Expected: ${expectedCount}`,
        `Found: ${count ?? 0}`,
      ].join("\n"),
    )
  }

  console.log(
    `✓ Verified ${expectedCount} generated receipts`,
  )
}

export async function runPaymentModule():
Promise<GeneratedPayment[]> {
  logHeader(
    "Executing Atlas Development Payment Workflows",
  )

  const payments =
    generatePayments()

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

  const events =
    createPaymentEvents(
      payments,
    )

  console.log(
    `✓ Prepared ${events.length} payment workflow events`,
  )

  console.log("")

  await executeWorkflow(
    workflowClient.supabase,
    workflowClient.userId,
    returnIdsByClientYear,
    events,
  )

  console.log("")

  await verifyPayments(
    workflowClient.supabase,
    payments.length,
  )

  await verifyReceipts(
    workflowClient.supabase,
    payments.length,
  )

  return payments
}