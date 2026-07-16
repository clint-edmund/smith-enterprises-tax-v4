import type {
  ClientTaxReturnItem,
  ReturnStaffOption,
  ReturnStatus,
  TaxReturnListItem,
} from "@/features/returns/types/return.types"
import { supabase } from "@/services/supabase"

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

export async function searchTaxReturns(
  search: string,
  status: ReturnStatus | "all",
  taxYear: number | null,
  preparerId: string | null,
): Promise<TaxReturnListItem[]> {
  const { data, error } = await supabase.rpc(
    "search_tax_returns",
    {
      requested_search:
        search.trim() || undefined,

      requested_status:
        status === "all"
          ? undefined
          : status,

      requested_tax_year:
        taxYear ?? undefined,

      requested_preparer_id:
        preparerId ?? undefined,

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
    clientFirstName:
      taxReturn.client_first_name,
    clientLastName:
      taxReturn.client_last_name,
    taxYear: taxReturn.tax_year,
    returnType: taxReturn.return_type,
    taxForm: taxReturn.tax_form,
    filingStatus:
      taxReturn.filing_status,
    status: taxReturn.status,
    assignedPreparerId:
      taxReturn.assigned_preparer_id,
    assignedPreparerName:
      taxReturn.assigned_preparer_name,
    assignedReviewerId:
      taxReturn.assigned_reviewer_id,
    assignedReviewerName:
      taxReturn.assigned_reviewer_name,
    dateReceived:
      taxReturn.date_received,
    dueDate: taxReturn.due_date,
    filedDate: taxReturn.filed_date,
    acceptedDate:
      taxReturn.accepted_date,
    preparationFee: toNumber(
      taxReturn.preparation_fee,
    ),
    discountAmount: toNumber(
      taxReturn.discount_amount,
    ),
    netFee: toNumber(
      taxReturn.net_fee,
    ),
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
    filingStatus:
      taxReturn.filing_status,
    status: taxReturn.status,
    assignedPreparerId:
      taxReturn.assigned_preparer_id,
    assignedPreparerName:
      taxReturn.assigned_preparer_name,
    assignedReviewerId:
      taxReturn.assigned_reviewer_id,
    assignedReviewerName:
      taxReturn.assigned_reviewer_name,
    dateReceived:
      taxReturn.date_received,
    dueDate: taxReturn.due_date,
    filedDate: taxReturn.filed_date,
    acceptedDate:
      taxReturn.accepted_date,
    preparationFee: toNumber(
      taxReturn.preparation_fee,
    ),
    discountAmount: toNumber(
      taxReturn.discount_amount,
    ),
    netFee: toNumber(
      taxReturn.net_fee,
    ),
    createdAt: taxReturn.created_at,
    updatedAt: taxReturn.updated_at,
  }))
}

export async function getReturnStaffOptions():
  Promise<ReturnStaffOption[]> {
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