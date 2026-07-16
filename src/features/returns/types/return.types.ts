import type { Database } from "@/types/database.types"

export type ReturnType =
  Database["public"]["Enums"]["return_type"]

export type TaxFormType =
  Database["public"]["Enums"]["tax_form_type"]

export type FilingStatus =
  Database["public"]["Enums"]["filing_status"]

export type ReturnStatus =
  Database["public"]["Enums"]["return_status"]

export interface ReturnStaffOption {
  id: string
  displayName: string
  email: string
  role:
    Database["public"]["Enums"]["app_role"]
}
export interface ReturnClientOption {
  id: string
  clientNumber: number
  firstName: string
  lastName: string
  email: string | null
  status:
    Database["public"]["Enums"]["client_status"]
}

export interface TaxReturnListItem {
  id: string
  clientId: string
  clientNumber: number
  clientFirstName: string
  clientLastName: string
  taxYear: number
  returnType: ReturnType
  taxForm: TaxFormType
  filingStatus: FilingStatus
  status: ReturnStatus
  assignedPreparerId: string | null
  assignedPreparerName: string | null
  assignedReviewerId: string | null
  assignedReviewerName: string | null
  dateReceived: string | null
  dueDate: string | null
  filedDate: string | null
  acceptedDate: string | null
  preparationFee: number
  discountAmount: number
  netFee: number
  createdAt: string
  updatedAt: string
}

export interface ClientTaxReturnItem {
  id: string
  clientId: string
  taxYear: number
  returnType: ReturnType
  taxForm: TaxFormType
  filingStatus: FilingStatus
  status: ReturnStatus
  assignedPreparerId: string | null
  assignedPreparerName: string | null
  assignedReviewerId: string | null
  assignedReviewerName: string | null
  dateReceived: string | null
  dueDate: string | null
  filedDate: string | null
  acceptedDate: string | null
  preparationFee: number
  discountAmount: number
  netFee: number
  createdAt: string
  updatedAt: string
}

export interface TaxReturnRecord {
  id: string
  clientId: string
  taxYear: number
  returnType: ReturnType
  taxForm: TaxFormType
  filingStatus: FilingStatus
  status: ReturnStatus
  assignedPreparerId: string | null
  assignedReviewerId: string | null
  dateReceived: string | null
  dueDate: string | null
  filedDate: string | null
  acceptedDate: string | null
  preparationFee: number
  discountAmount: number
  description: string | null
  federalReturnRequired: boolean
  stateReturnRequired: boolean
  localReturnRequired: boolean
  extensionFiled: boolean
  extensionDate: string | null
  estimatedRefund: number
  estimatedAmountDue: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface TaxReturnDetails {
  id: string

  clientId: string
  clientNumber: number
  clientFirstName: string
  clientMiddleName: string | null
  clientLastName: string
  clientPreferredName: string | null
  clientEmail: string | null
  clientPhone: string | null

  taxYear: number
  returnType: ReturnType
  taxForm: TaxFormType
  filingStatus: FilingStatus
  status: ReturnStatus
  description: string | null

  assignedPreparerId: string | null
  assignedPreparerName: string | null
  assignedPreparerEmail: string | null

  assignedReviewerId: string | null
  assignedReviewerName: string | null
  assignedReviewerEmail: string | null

  dateReceived: string | null
  dueDate: string | null
  filedDate: string | null
  acceptedDate: string | null

  federalReturnRequired: boolean
  stateReturnRequired: boolean
  localReturnRequired: boolean

  extensionFiled: boolean
  extensionDate: string | null

  preparationFee: number
  discountAmount: number
  netFee: number

  estimatedRefund: number
  estimatedAmountDue: number

  notes: string | null

  createdAt: string
  updatedAt: string
}

export interface TaxReturnActivity {
  id: number
  action: string
  actorId: string | null
  actorName: string
  occurredAt: string
}

export interface TaxReturnDetailData {
  taxReturn: TaxReturnDetails
  activities: TaxReturnActivity[]
}

export interface TaxReturnFormValues {
  clientId: string
  taxYear: number
  returnType: ReturnType
  taxForm: TaxFormType
  filingStatus: FilingStatus
  status: ReturnStatus
  assignedPreparerId: string
  assignedReviewerId: string
  dateReceived: string
  dueDate: string
  filedDate: string
  acceptedDate: string
  preparationFee: number
  discountAmount: number
  description: string
  federalReturnRequired: boolean
  stateReturnRequired: boolean
  localReturnRequired: boolean
  extensionFiled: boolean
  extensionDate: string
  estimatedRefund: number
  estimatedAmountDue: number
  notes: string
}