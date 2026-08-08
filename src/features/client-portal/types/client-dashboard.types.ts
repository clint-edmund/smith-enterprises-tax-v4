import type {
  Database,
} from "@/types/database.types"

export type ClientDashboardReturnType =
  Database["public"]["Enums"]["return_type"]

export type ClientDashboardTaxForm =
  Database["public"]["Enums"]["tax_form_type"]

export type ClientDashboardReturnStatus =
  Database["public"]["Enums"]["return_status"]

export interface ClientDashboard {
  clientId: string

  clientNumber: number

  firstName: string

  preferredName: string | null

  currentReturnId: string | null

  currentTaxYear: number | null

  currentReturnType:
    | ClientDashboardReturnType
    | null

  currentTaxForm:
    | ClientDashboardTaxForm
    | null

  currentReturnStatus:
    | ClientDashboardReturnStatus
    | null

  currentReturnUpdatedAt: string | null

  assignedPreparerName: string | null

  preparationFee: number

  discountAmount: number

  totalPayments: number

  outstandingBalance: number

  documentCount: number

  recentDocumentId: string | null

  recentDocumentName: string | null

  recentDocumentCategory: string | null

  recentDocumentStatus: string | null

  recentDocumentUploadedAt: string | null
}