import { supabase } from "@/services/supabase"

import type { ClientReturnSummary } from "../types/client-return.types"

export async function getClientReturns(): Promise<ClientReturnSummary[]> {
  const { data, error } = await supabase.rpc(
    "get_client_returns"
  )

  if (error) {
    throw error
  }

  return (data ?? []).map(
    (row): ClientReturnSummary => ({
      returnId: row.return_id,

      taxYear: row.tax_year,

      returnType: row.return_type,

      taxForm: row.tax_form,

      status: row.status,

      assignedPreparerName:
        row.assigned_preparer_name,

      updatedAt: row.updated_at,

      preparationFee:
        Number(row.preparation_fee),

      discountAmount:
        Number(row.discount_amount),

      totalPayments:
        Number(row.total_payments),

      outstandingBalance:
        Number(row.outstanding_balance),

      documentCount:
        Number(row.document_count),
    })
  )
}