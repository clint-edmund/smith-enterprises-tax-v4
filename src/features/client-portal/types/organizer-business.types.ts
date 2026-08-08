export type OrganizerBusinessEntityType =
  | ""
  | "sole_proprietorship"
  | "single_member_llc"
  | "partnership"
  | "multi_member_llc"
  | "s_corporation"
  | "c_corporation"
  | "farm"
  | "other"

export type OrganizerBusinessAccountingMethod =
  | ""
  | "cash"
  | "accrual"
  | "other"

export type OrganizerBusinessRecordStatus =
  | "draft"
  | "complete"
  | "needs_review"

export interface OrganizerBusinessResponse {
  organizerId: string
  hasBusinessActivity: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

export interface OrganizerBusiness {
  id: string
  organizerId: string

  businessName: string
  dbaName: string
  entityType: OrganizerBusinessEntityType
  employerIdentificationNumber: string
  principalBusinessActivity: string
  businessCode: string

  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string

  dateStarted: string | null
  dateClosed: string | null
  ownershipPercentage: number | null
  accountingMethod: OrganizerBusinessAccountingMethod
  wasActiveDuringTaxYear: boolean | null

  hasHomeOffice: boolean | null
  hasEmployees: boolean | null
  hasInventory: boolean | null
  usesVehicle: boolean | null
  bookkeepingComplete: boolean | null

  grossReceipts: number
  returnsAndAllowances: number
  otherBusinessIncome: number
  costOfGoodsSold: number

  advertisingExpense: number
  carAndTruckExpense: number
  commissionsAndFeesExpense: number
  contractLaborExpense: number
  depreciationExpense: number
  employeeBenefitExpense: number
  insuranceExpense: number
  interestExpense: number
  legalAndProfessionalExpense: number
  officeExpense: number
  pensionAndProfitSharingExpense: number
  rentOrLeaseExpense: number
  repairsAndMaintenanceExpense: number
  suppliesExpense: number
  taxesAndLicensesExpense: number
  travelExpense: number
  deductibleMealsExpense: number
  utilitiesExpense: number
  wagesExpense: number
  otherExpense: number
  otherExpenseDescription: string

  notes: string
  recordStatus: OrganizerBusinessRecordStatus
  displayOrder: number

  createdAt: string
  updatedAt: string
}

export interface SaveOrganizerBusinessActivityRequest {
  organizerId: string
  hasBusinessActivity: boolean
}

export interface OrganizerBusinessFormValues {
  businessName: string
  dbaName: string
  entityType: OrganizerBusinessEntityType
  employerIdentificationNumber: string
  principalBusinessActivity: string
  businessCode: string

  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string

  dateStarted: string
  dateClosed: string
  ownershipPercentage: string
  accountingMethod: OrganizerBusinessAccountingMethod
  wasActiveDuringTaxYear: boolean | null

  hasHomeOffice: boolean | null
  hasEmployees: boolean | null
  hasInventory: boolean | null
  usesVehicle: boolean | null
  bookkeepingComplete: boolean | null

  grossReceipts: string
  returnsAndAllowances: string
  otherBusinessIncome: string
  costOfGoodsSold: string

  advertisingExpense: string
  carAndTruckExpense: string
  commissionsAndFeesExpense: string
  contractLaborExpense: string
  depreciationExpense: string
  employeeBenefitExpense: string
  insuranceExpense: string
  interestExpense: string
  legalAndProfessionalExpense: string
  officeExpense: string
  pensionAndProfitSharingExpense: string
  rentOrLeaseExpense: string
  repairsAndMaintenanceExpense: string
  suppliesExpense: string
  taxesAndLicensesExpense: string
  travelExpense: string
  deductibleMealsExpense: string
  utilitiesExpense: string
  wagesExpense: string
  otherExpense: string
  otherExpenseDescription: string

  notes: string
}

export interface SaveOrganizerBusinessRequest {
  organizerId: string
  business: OrganizerBusinessFormValues
}

export interface UpdateOrganizerBusinessRequest
  extends SaveOrganizerBusinessRequest {
  businessId: string
}

export interface DeleteOrganizerBusinessRequest {
  organizerId: string
  businessId: string
}

export interface DeleteOrganizerBusinessResult {
  deletedBusinessId: string
  success: boolean
}

export interface OrganizerBusinessValidationErrors {
  businessName?: string
  entityType?: string
  principalBusinessActivity?: string
  employerIdentificationNumber?: string
  state?: string
  dateStarted?: string
  dateClosed?: string
  ownershipPercentage?: string
  accountingMethod?: string
  wasActiveDuringTaxYear?: string
  grossReceipts?: string
  returnsAndAllowances?: string
  otherBusinessIncome?: string
  costOfGoodsSold?: string
  advertisingExpense?: string
  carAndTruckExpense?: string
  commissionsAndFeesExpense?: string
  contractLaborExpense?: string
  depreciationExpense?: string
  employeeBenefitExpense?: string
  insuranceExpense?: string
  interestExpense?: string
  legalAndProfessionalExpense?: string
  officeExpense?: string
  pensionAndProfitSharingExpense?: string
  rentOrLeaseExpense?: string
  repairsAndMaintenanceExpense?: string
  suppliesExpense?: string
  taxesAndLicensesExpense?: string
  travelExpense?: string
  deductibleMealsExpense?: string
  utilitiesExpense?: string
  wagesExpense?: string
  otherExpense?: string
  otherExpenseDescription?: string
  notes?: string
  form?: string
}

export const emptyOrganizerBusinessFormValues:
  OrganizerBusinessFormValues = {
    businessName: "",
    dbaName: "",
    entityType: "",
    employerIdentificationNumber: "",
    principalBusinessActivity: "",
    businessCode: "",

    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",

    dateStarted: "",
    dateClosed: "",
    ownershipPercentage: "",
    accountingMethod: "",
    wasActiveDuringTaxYear: null,

    hasHomeOffice: null,
    hasEmployees: null,
    hasInventory: null,
    usesVehicle: null,
    bookkeepingComplete: null,

    grossReceipts: "",
    returnsAndAllowances: "",
    otherBusinessIncome: "",
    costOfGoodsSold: "",

    advertisingExpense: "",
    carAndTruckExpense: "",
    commissionsAndFeesExpense: "",
    contractLaborExpense: "",
    depreciationExpense: "",
    employeeBenefitExpense: "",
    insuranceExpense: "",
    interestExpense: "",
    legalAndProfessionalExpense: "",
    officeExpense: "",
    pensionAndProfitSharingExpense: "",
    rentOrLeaseExpense: "",
    repairsAndMaintenanceExpense: "",
    suppliesExpense: "",
    taxesAndLicensesExpense: "",
    travelExpense: "",
    deductibleMealsExpense: "",
    utilitiesExpense: "",
    wagesExpense: "",
    otherExpense: "",
    otherExpenseDescription: "",

    notes: "",
  }
