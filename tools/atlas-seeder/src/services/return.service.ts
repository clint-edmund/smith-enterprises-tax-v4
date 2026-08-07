import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import type {
  GeneratedReturn,
} from "../models/generated-return"

interface ClientLookupRow {
  id: string
  client_number: number
}

interface ProfileLookupRow {
  id: string
  email: string
}

interface ReturnInsertRow {
  client_id: string
  tax_year: number

  return_type: GeneratedReturn["returnType"]
  tax_form: GeneratedReturn["taxForm"]
  filing_status: GeneratedReturn["filingStatus"]

  status: GeneratedReturn["status"]
  workflow_status: GeneratedReturn["workflowStatus"]

  assigned_preparer_id: string | null
  assigned_reviewer_id: string | null

  date_received: string | null
  due_date: string | null
  filed_date: string | null
  accepted_date: string | null

  preparation_fee: number
  discount_amount: number

  estimated_refund: number
  estimated_amount_due: number

  federal_return_required: boolean
  state_return_required: boolean
  local_return_required: boolean

  extension_filed: boolean
  extension_date: string | null

  workflow_status_changed_at: string
  assigned_at: string | null

  workflow_hold_reason: string | null
  workflow_held_at: string | null
  workflow_completed_at: string | null

  description: string
  notes: string

  created_by: string
  updated_by: string

  created_at: string
  updated_at: string
}

async function loadClientMap(
  supabase: SupabaseClient,
): Promise<Map<number, string>> {
  const {
    data,
    error,
  } = await supabase
    .from("clients")
    .select(
      `
        id,
        client_number
      `,
    )
    .gte(
      "client_number",
      900001,
    )
    .lte(
      "client_number",
      999999,
    )

  if (error) {
    throw error
  }

  const rows =
    data as ClientLookupRow[]

  return new Map(
    rows.map(
      (row) => [
        Number(row.client_number),
        row.id,
      ],
    ),
  )
}

async function loadProfileMap(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(
      `
        id,
        email
      `,
    )
    .like(
      "email",
      "%@atlas.local",
    )

  if (error) {
    throw error
  }

  const rows =
    data as ProfileLookupRow[]

  return new Map(
    rows.map(
      (row) => [
        row.email.toLowerCase(),
        row.id,
      ],
    ),
  )
}

function resolveProfileId(
  profileMap: Map<string, string>,
  email: string | null,
): string | null {
  if (!email) {
    return null
  }

  const id =
    profileMap.get(
      email.toLowerCase(),
    )

  if (!id) {
    throw new Error(
      `Unable to resolve profile for ${email}.`,
    )
  }

  return id
}

function mapReturnToInsert(
  taxReturn: GeneratedReturn,
  clientMap: Map<number, string>,
  profileMap: Map<string, string>,
  actorUserId: string,
): ReturnInsertRow {
  const clientId =
    clientMap.get(
      taxReturn.clientNumber,
    )

  if (!clientId) {
    throw new Error(
      `Unable to resolve client ${taxReturn.clientNumber}.`,
    )
  }

  return {
    client_id:
      clientId,

    tax_year:
      taxReturn.taxYear,

    return_type:
      taxReturn.returnType,

    tax_form:
      taxReturn.taxForm,

    filing_status:
      taxReturn.filingStatus,

    status:
      taxReturn.status,

    workflow_status:
      taxReturn.workflowStatus,

    assigned_preparer_id:
      resolveProfileId(
        profileMap,
        taxReturn.assignedPreparerEmail,
      ),

    assigned_reviewer_id:
      resolveProfileId(
        profileMap,
        taxReturn.assignedReviewerEmail,
      ),

    date_received:
      taxReturn.dateReceived,

    due_date:
      taxReturn.dueDate,

    filed_date:
      taxReturn.filedDate,

    accepted_date:
      taxReturn.acceptedDate,

    preparation_fee:
      taxReturn.preparationFee,

    discount_amount:
      taxReturn.discountAmount,

    estimated_refund:
      taxReturn.estimatedRefund,

    estimated_amount_due:
      taxReturn.estimatedAmountDue,

    federal_return_required:
      taxReturn.federalReturnRequired,

    state_return_required:
      taxReturn.stateReturnRequired,

    local_return_required:
      taxReturn.localReturnRequired,

    extension_filed:
      taxReturn.extensionFiled,

    extension_date:
      taxReturn.extensionDate,

    workflow_status_changed_at:
      taxReturn.workflowStatusChangedAt,

    assigned_at:
      taxReturn.assignedAt,

    workflow_hold_reason:
      taxReturn.workflowHoldReason,

    workflow_held_at:
      taxReturn.workflowHeldAt,

    workflow_completed_at:
      taxReturn.workflowCompletedAt,

    description:
      taxReturn.description,

    notes:
      taxReturn.notes,

    created_by:
      actorUserId,

    updated_by:
      actorUserId,

    created_at:
      taxReturn.createdAt,

    updated_at:
      taxReturn.updatedAt,
  }
}

export async function seedReturns(
  supabase: SupabaseClient,
  returns: readonly GeneratedReturn[],
  actorUserId: string,
): Promise<void> {
  const clientMap =
    await loadClientMap(
      supabase,
    )

  const profileMap =
    await loadProfileMap(
      supabase,
    )

  const rows =
    returns.map(
      (taxReturn) =>
        mapReturnToInsert(
          taxReturn,
          clientMap,
          profileMap,
          actorUserId,
        ),
    )

  const batchSize = 50

  for (
    let offset = 0;
    offset < rows.length;
    offset += batchSize
  ) {
    const batch =
      rows.slice(
        offset,
        offset + batchSize,
      )

    const {
      error,
    } = await supabase
      .from("tax_returns")
      .upsert(
        batch,
        {
          onConflict:
            "client_id,tax_year",
        },
      )

    if (error) {
      throw new Error(
        [
          "Tax return seeding failed.",
          `Batch offset: ${offset}`,
          error.message,
        ].join("\n"),
      )
    }

    console.log(
      `✓ Returns ${offset + 1}-${Math.min(
        offset + batch.length,
        rows.length,
      )}`,
    )
  }
}

export async function verifyReturns(
  supabase: SupabaseClient,
  expectedCount: number,
): Promise<void> {
  const {
    count,
    error,
  } = await supabase
    .from("tax_returns")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .gte(
      "tax_year",
      2024,
    )
    .lte(
      "tax_year",
      2025,
    )

  if (error) {
    throw error
  }

  if (count !== expectedCount) {
    throw new Error(
      [
        "Development tax return verification failed.",
        `Expected: ${expectedCount}`,
        `Found: ${count ?? 0}`,
      ].join("\n"),
    )
  }

  console.log(
    `✓ Verified ${expectedCount} development tax returns`,
  )
}