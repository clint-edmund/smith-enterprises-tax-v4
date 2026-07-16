import type {
  ClientTaxReturnItem,
  ReturnClientOption,
  ReturnStaffOption,
  ReturnStatus,
  TaxReturnActivity,
  TaxReturnDetailData,
  TaxReturnDetails,
  TaxReturnFormValues,
  TaxReturnListItem,
  TaxReturnRecord,
} from "@/features/returns/types/return.types"
import { searchClients } from "@/features/clients/services/client-service"
import { supabase } from "@/services/supabase"

function toOptionalString(
  value: string,
): string | undefined {
  const trimmedValue = value.trim()

  return trimmedValue === ""
    ? undefined
    : trimmedValue
}

function toNumber(
  value: number | string | null,
): number {
  if (value === null) {
    return 0
  }

  const convertedValue = Number(value)

  return Number.isFinite(convertedValue)
    ? convertedValue
    : 0
}

function mapTaxReturnRecord(
  taxReturn: {
    id: string
    client_id: string
    tax_year: number
    return_type: TaxReturnRecord["returnType"]
    tax_form: TaxReturnRecord["taxForm"]
    filing_status: TaxReturnRecord["filingStatus"]
    status: TaxReturnRecord["status"]
    assigned_preparer_id: string | null
    assigned_reviewer_id: string | null
    date_received: string | null
    due_date: string | null
    filed_date: string | null
    accepted_date: string | null
    preparation_fee: number | string
    discount_amount: number | string
    description: string | null
    federal_return_required: boolean
    state_return_required: boolean
    local_return_required: boolean
    extension_filed: boolean
    extension_date: string | null
    estimated_refund: number | string
    estimated_amount_due: number | string
    notes: string | null
    created_at: string
    updated_at: string
  },
): TaxReturnRecord {
  return {
    id: taxReturn.id,
    clientId: taxReturn.client_id,
    taxYear: taxReturn.tax_year,
    returnType: taxReturn.return_type,
    taxForm: taxReturn.tax_form,
    filingStatus: taxReturn.filing_status,
    status: taxReturn.status,
    assignedPreparerId: taxReturn.assigned_preparer_id,
    assignedReviewerId: taxReturn.assigned_reviewer_id,
    dateReceived: taxReturn.date_received,
    dueDate: taxReturn.due_date,
    filedDate: taxReturn.filed_date,
    acceptedDate: taxReturn.accepted_date,
    preparationFee: toNumber(taxReturn.preparation_fee),
    discountAmount: toNumber(taxReturn.discount_amount),
    description: taxReturn.description,
    federalReturnRequired: taxReturn.federal_return_required,
    stateReturnRequired: taxReturn.state_return_required,
    localReturnRequired: taxReturn.local_return_required,
    extensionFiled: taxReturn.extension_filed,
    extensionDate: taxReturn.extension_date,
    estimatedRefund: toNumber(taxReturn.estimated_refund),
    estimatedAmountDue: toNumber(taxReturn.estimated_amount_due),
    notes: taxReturn.notes,
    createdAt: taxReturn.created_at,
    updatedAt: taxReturn.updated_at,
  }
}

export async function searchTaxReturns(
  search: string,
  status: ReturnStatus | "all",
  taxYear: number | null,
  preparerId: string | null,
): Promise<TaxReturnListItem[]> {
  const { data, error } = await supabase.rpc(
    "search_tax_returns",
    {
      requested_search: search.trim() || undefined,
      requested_status:
        status === "all"
          ? undefined
          : status,
      requested_tax_year: taxYear ?? undefined,
      requested_preparer_id: preparerId ?? undefined,
      requested_limit: 250,
    },
  )

  if (error) {
    throw error
  }

  return (data ?? []).map((taxReturn) => ({
    id: taxReturn.id,
    clientId: taxReturn.client_id,
    clientNumber: taxReturn.client_number,
    clientFirstName: taxReturn.client_first_name,
    clientLastName: taxReturn.client_last_name,
    taxYear: taxReturn.tax_year,
    returnType: taxReturn.return_type,
    taxForm: taxReturn.tax_form,
    filingStatus: taxReturn.filing_status,
    status: taxReturn.status,
    assignedPreparerId: taxReturn.assigned_preparer_id,
    assignedPreparerName: taxReturn.assigned_preparer_name,
    assignedReviewerId: taxReturn.assigned_reviewer_id,
    assignedReviewerName: taxReturn.assigned_reviewer_name,
    dateReceived: taxReturn.date_received,
    dueDate: taxReturn.due_date,
    filedDate: taxReturn.filed_date,
    acceptedDate: taxReturn.accepted_date,
    preparationFee: toNumber(taxReturn.preparation_fee),
    discountAmount: toNumber(taxReturn.discount_amount),
    netFee: toNumber(taxReturn.net_fee),
    createdAt: taxReturn.created_at,
    updatedAt: taxReturn.updated_at,
  }))
}

export async function getClientTaxReturns(
  clientId: string,
): Promise<ClientTaxReturnItem[]> {
  const { data, error } = await supabase.rpc(
    "get_client_tax_returns",
    {
      requested_client_id: clientId,
    },
  )

  if (error) {
    throw error
  }

  return (data ?? []).map((taxReturn) => ({
    id: taxReturn.id,
    clientId: taxReturn.client_id,
    taxYear: taxReturn.tax_year,
    returnType: taxReturn.return_type,
    taxForm: taxReturn.tax_form,
    filingStatus: taxReturn.filing_status,
    status: taxReturn.status,
    assignedPreparerId: taxReturn.assigned_preparer_id,
    assignedPreparerName: taxReturn.assigned_preparer_name,
    assignedReviewerId: taxReturn.assigned_reviewer_id,
    assignedReviewerName: taxReturn.assigned_reviewer_name,
    dateReceived: taxReturn.date_received,
    dueDate: taxReturn.due_date,
    filedDate: taxReturn.filed_date,
    acceptedDate: taxReturn.accepted_date,
    preparationFee: toNumber(taxReturn.preparation_fee),
    discountAmount: toNumber(taxReturn.discount_amount),
    netFee: toNumber(taxReturn.net_fee),
    createdAt: taxReturn.created_at,
    updatedAt: taxReturn.updated_at,
  }))
}

export async function getReturnStaffOptions(): Promise<ReturnStaffOption[]> {
  const { data, error } = await supabase.rpc(
    "get_return_staff_options",
  )

  if (error) {
    throw error
  }

  return (data ?? []).map((staff) => ({
    id: staff.id,
    displayName: staff.display_name,
    email: staff.email,
    role: staff.role,
  }))
}

export async function getReturnClientOptions(): Promise<ReturnClientOption[]> {
  const clients = await searchClients(
    "",
    "active",
  )

  return clients.map((client) => ({
    id: client.id,
    clientNumber: client.clientNumber,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    status: client.status,
  }))
}

export async function createTaxReturn(
  values: TaxReturnFormValues,
): Promise<TaxReturnRecord> {
  const { data, error } = await supabase.rpc(
    "create_tax_return_record",
    {
      requested_client_id: values.clientId,
      requested_tax_year: values.taxYear,
      requested_return_type: values.returnType,
      requested_tax_form: values.taxForm,
      requested_filing_status: values.filingStatus,
      requested_status: values.status,
      requested_assigned_preparer_id:
        toOptionalString(values.assignedPreparerId),
      requested_assigned_reviewer_id:
        toOptionalString(values.assignedReviewerId),
      requested_date_received:
        toOptionalString(values.dateReceived),
      requested_due_date:
        toOptionalString(values.dueDate),
      requested_filed_date:
        toOptionalString(values.filedDate),
      requested_accepted_date:
        toOptionalString(values.acceptedDate),
      requested_preparation_fee: values.preparationFee,
      requested_discount_amount: values.discountAmount,
      requested_description:
        toOptionalString(values.description),
      requested_federal_return_required:
        values.federalReturnRequired,
      requested_state_return_required:
        values.stateReturnRequired,
      requested_local_return_required:
        values.localReturnRequired,
      requested_extension_filed:
        values.extensionFiled,
      requested_extension_date:
        values.extensionFiled
          ? toOptionalString(values.extensionDate)
          : undefined,
      requested_estimated_refund:
        values.estimatedRefund,
      requested_estimated_amount_due:
        values.estimatedAmountDue,
      requested_notes:
        toOptionalString(values.notes),
    },
  )

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error(
      "The tax return was created, but no record was returned.",
    )
  }

  return mapTaxReturnRecord(data)
}

export async function getTaxReturnById(
  returnId: string,
): Promise<TaxReturnRecord | null> {
  const { data, error } = await supabase
    .from("tax_returns")
    .select("*")
    .eq("id", returnId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return mapTaxReturnRecord(data)
}
export async function getTaxReturnDetails(
  returnId: string,
): Promise<TaxReturnDetails | null> {
  const { data, error } = await supabase.rpc(
    "get_tax_return_details",
    {
      requested_return_id: returnId,
    },
  )

  if (error) {
    throw error
  }

  const detailRow = data?.[0]

  if (!detailRow) {
    return null
  }

  return {
    id: detailRow.id,

    clientId: detailRow.client_id,
    clientNumber:
      detailRow.client_number,
    clientFirstName:
      detailRow.client_first_name,
    clientMiddleName:
      detailRow.client_middle_name,
    clientLastName:
      detailRow.client_last_name,
    clientPreferredName:
      detailRow.client_preferred_name,
    clientEmail:
      detailRow.client_email,
    clientPhone:
      detailRow.client_phone,

    taxYear: detailRow.tax_year,
    returnType:
      detailRow.return_type,
    taxForm: detailRow.tax_form,
    filingStatus:
      detailRow.filing_status,
    status: detailRow.status,
    description:
      detailRow.description,

    assignedPreparerId:
      detailRow.assigned_preparer_id,
    assignedPreparerName:
      detailRow.assigned_preparer_name,
    assignedPreparerEmail:
      detailRow.assigned_preparer_email,

    assignedReviewerId:
      detailRow.assigned_reviewer_id,
    assignedReviewerName:
      detailRow.assigned_reviewer_name,
    assignedReviewerEmail:
      detailRow.assigned_reviewer_email,

    dateReceived:
      detailRow.date_received,
    dueDate: detailRow.due_date,
    filedDate: detailRow.filed_date,
    acceptedDate:
      detailRow.accepted_date,

    federalReturnRequired:
      detailRow.federal_return_required,
    stateReturnRequired:
      detailRow.state_return_required,
    localReturnRequired:
      detailRow.local_return_required,

    extensionFiled:
      detailRow.extension_filed,
    extensionDate:
      detailRow.extension_date,

    preparationFee: toNumber(
      detailRow.preparation_fee,
    ),
    discountAmount: toNumber(
      detailRow.discount_amount,
    ),
    netFee: toNumber(
      detailRow.net_fee,
    ),

    estimatedRefund: toNumber(
      detailRow.estimated_refund,
    ),
    estimatedAmountDue: toNumber(
      detailRow.estimated_amount_due,
    ),

    notes: detailRow.notes,

    createdAt: detailRow.created_at,
    updatedAt: detailRow.updated_at,
  }
}

export async function getTaxReturnActivity(
  returnId: string,
): Promise<TaxReturnActivity[]> {
  const { data, error } = await supabase.rpc(
    "get_tax_return_activity",
    {
      requested_return_id: returnId,
      requested_limit: 25,
    },
  )

  if (error) {
    throw error
  }

  return (data ?? []).map(
    (activity) => ({
      id: activity.id,
      action: activity.action,
      actorId: activity.actor_id,
      actorName: activity.actor_name,
      occurredAt: activity.occurred_at,
    }),
  )
}

export async function getTaxReturnDetailData(
  returnId: string,
): Promise<TaxReturnDetailData | null> {
  const taxReturn =
    await getTaxReturnDetails(returnId)

  if (!taxReturn) {
    return null
  }

  let activities: TaxReturnActivity[] = []

  try {
    activities =
      await getTaxReturnActivity(returnId)
  } catch (error) {
    console.error(
      "Unable to load tax return activity:",
      error,
    )
  }

  return {
    taxReturn,
    activities,
  }
}