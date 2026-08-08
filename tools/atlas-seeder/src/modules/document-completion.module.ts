import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  generateReturns,
} from "../generators/returns"

import {
  logHeader,
} from "../utils/logger"

import {
  createAuthenticatedWorkflowClient,
} from "../workflow/authenticated-client"

import {
  getReturnLookupKey,
  loadReturnIdsByClientYear,
} from "../workflow/return-lookup"

const completionTargets = {
  critical: 0.15,
  high: 0.45,
  medium: 0.70,
  low: 0.90,
  review: 1.00,
  on_hold: 0.35,
  completed: 1.00,
  historical: 1.00,
} as const

interface RequiredDocumentRow {
  id: string
  sort_order: number
  is_complete: boolean
}

async function loadChecklist(
  supabase: SupabaseClient,
  returnId: string,
): Promise<RequiredDocumentRow[]> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "return_required_documents",
    )
    .select(`
      id,
      sort_order,
      is_complete
    `)
    .eq(
      "tax_return_id",
      returnId,
    )
    .order(
      "sort_order",
    )
    .order(
      "id",
    )

  if (error) {
    throw new Error(
      [
        `Unable to load required documents for return ${returnId}.`,
        error.message,
      ].join("\n"),
    )
  }

  return (
    data ?? []
  ) as RequiredDocumentRow[]
}

async function setDocumentCompletion(
  supabase: SupabaseClient,
  requiredDocumentId: string,
  isComplete: boolean,
): Promise<void> {
  const {
    error,
  } = await supabase.rpc(
    "complete_required_document",
    {
      requested_required_document_id:
        requiredDocumentId,

      requested_document_id:
        null,

      requested_is_complete:
        isComplete,

      requested_notes:
        isComplete
          ? "Completed by Atlas development simulation."
          : "Reset by Atlas development simulation.",
    },
  )

  if (error) {
    throw new Error(
      [
        `Unable to update required document ${requiredDocumentId}.`,
        error.message,
      ].join("\n"),
    )
  }
}

export async function runDocumentCompletionModule():
Promise<number> {
  logHeader(
    "Completing Required Documents",
  )

  const workflow =
    await createAuthenticatedWorkflowClient()

  console.log(
    `✓ Authenticated workflow client: ${workflow.email}`,
  )

  const lookup =
    await loadReturnIdsByClientYear(
      workflow.supabase,
    )

  console.log(
    `✓ Loaded ${lookup.size} tax-return references`,
  )

  const generatedReturns =
    generateReturns()

  let changedCount = 0
  let completedCount = 0
  let processedReturns = 0

  for (
    const generatedReturn
    of generatedReturns
  ) {
    const key =
      getReturnLookupKey(
        generatedReturn.clientNumber,
        generatedReturn.taxYear,
      )

    const returnId =
      lookup.get(
        key,
      )

    if (!returnId) {
      throw new Error(
        `Unable to resolve tax return ${key}.`,
      )
    }

    const checklist =
      await loadChecklist(
        workflow.supabase,
        returnId,
      )

    const target =
      completionTargets[
        generatedReturn.intelligenceProfile
      ]

    const numberToComplete =
      Math.floor(
        checklist.length *
          target,
      )

    /*
     * The first N checklist records should be
     * complete. Everything after N should remain
     * incomplete.
     *
     * This makes the simulator convergent:
     * repeated runs always produce the same state.
     */
    for (
      let index = 0;
      index < checklist.length;
      index += 1
    ) {
      const item =
        checklist[index]

      const shouldBeComplete =
        index <
        numberToComplete

      if (
        item.is_complete !==
        shouldBeComplete
      ) {
        await setDocumentCompletion(
          workflow.supabase,
          item.id,
          shouldBeComplete,
        )

        changedCount += 1
      }

      if (shouldBeComplete) {
        completedCount += 1
      }
    }

    processedReturns += 1

    if (
      processedReturns % 25 === 0
    ) {
      console.log(
        `✓ Processed document completion for ${processedReturns} returns`,
      )
    }
  }

  console.log(
    `✓ Processed ${processedReturns} returns`,
  )

  console.log(
    `✓ ${changedCount} required-document states changed`,
  )

  console.log(
    `✓ ${completedCount} required documents are complete`,
  )

  return completedCount
}