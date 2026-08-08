import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  createAuthenticatedWorkflowClient,
} from "../workflow/authenticated-client"

import {
  loadReturnIdsByClientYear,
} from "../workflow/return-lookup"

import {
  logHeader,
} from "../utils/logger"

async function initializeReturnDocuments(
  supabase: SupabaseClient,
  returnId: string,
): Promise<number> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "initialize_required_documents",
    {
      requested_return_id:
        returnId,
    },
  )

  if (error) {
    throw new Error(
      [
        `Unable to initialize required documents for return ${returnId}.`,
        error.message,
      ].join("\n"),
    )
  }

  return Number(
    data ?? 0,
  )
}

async function verifyRequiredDocuments(
  supabase: SupabaseClient,
): Promise<number> {
  const {
    count,
    error,
  } = await supabase
    .from("return_required_documents")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )

  if (error) {
    throw new Error(
      [
        "Unable to verify required documents.",
        error.message,
      ].join("\n"),
    )
  }

  const verifiedCount =
    count ?? 0

  if (
    verifiedCount === 0
  ) {
    throw new Error(
      "No required documents were initialized.",
    )
  }

  console.log(
    `✓ Verified ${verifiedCount} required-document records`,
  )

  return verifiedCount
}

export async function runRequiredDocumentsModule():
Promise<number> {
  logHeader(
    "Initializing Atlas Required Documents",
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

  let insertedCount = 0
  let processedCount = 0

  for (
    const returnId
    of returnIdsByClientYear.values()
  ) {
    insertedCount +=
      await initializeReturnDocuments(
        workflowClient.supabase,
        returnId,
      )

    processedCount += 1

    if (
      processedCount % 25 === 0
    ) {
      console.log(
        `✓ Initialized documents for ${processedCount} returns`,
      )
    }
  }

  console.log(
    `✓ Processed ${processedCount} returns`,
  )

  console.log(
    `✓ Inserted ${insertedCount} new required-document rows`,
  )

  const requiredDocumentCount =
    await verifyRequiredDocuments(
      workflowClient.supabase,
    )

  return requiredDocumentCount
}