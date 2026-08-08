import {
  supabase,
} from "@/services/supabase"

import type {
  Json,
} from "@/types/database.types"

import type {
  DeleteOrganizerBusinessRequest,
  DeleteOrganizerBusinessResult,
  OrganizerBusiness,
  OrganizerBusinessAccountingMethod,
  OrganizerBusinessEntityType,
  OrganizerBusinessFormValues,
  OrganizerBusinessRecordStatus,
  OrganizerBusinessResponse,
  SaveOrganizerBusinessActivityRequest,
  SaveOrganizerBusinessRequest,
  UpdateOrganizerBusinessRequest,
} from "@/features/client-portal/types/organizer-business.types"

type BusinessResponseRow = {
  organizer_id: string
  has_business_activity:
    | boolean
    | null
  created_at: string | null
  updated_at: string | null
}

type BusinessRow = {
  id: string
  organizer_id: string

  business_name: string
  dba_name: string
  entity_type: string
  employer_identification_number:
    string
  principal_business_activity: string
  business_code: string

  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postal_code: string
  country: string

  date_started: string | null
  date_closed: string | null
  ownership_percentage:
    | number
    | string
    | null
  accounting_method: string
  was_active_during_tax_year:
    | boolean
    | null

  has_home_office: boolean | null
  has_employees: boolean | null
  has_inventory: boolean | null
  uses_vehicle: boolean | null
  bookkeeping_complete: boolean | null

  gross_receipts:
    | number
    | string
    | null
  returns_and_allowances:
    | number
    | string
    | null
  other_business_income:
    | number
    | string
    | null
  cost_of_goods_sold:
    | number
    | string
    | null

  advertising_expense:
    | number
    | string
    | null
  car_and_truck_expense:
    | number
    | string
    | null
  commissions_and_fees_expense:
    | number
    | string
    | null
  contract_labor_expense:
    | number
    | string
    | null
  depreciation_expense:
    | number
    | string
    | null
  employee_benefit_expense:
    | number
    | string
    | null
  insurance_expense:
    | number
    | string
    | null
  interest_expense:
    | number
    | string
    | null
  legal_and_professional_expense:
    | number
    | string
    | null
  office_expense:
    | number
    | string
    | null
  pension_and_profit_sharing_expense:
    | number
    | string
    | null
  rent_or_lease_expense:
    | number
    | string
    | null
  repairs_and_maintenance_expense:
    | number
    | string
    | null
  supplies_expense:
    | number
    | string
    | null
  taxes_and_licenses_expense:
    | number
    | string
    | null
  travel_expense:
    | number
    | string
    | null
  deductible_meals_expense:
    | number
    | string
    | null
  utilities_expense:
    | number
    | string
    | null
  wages_expense:
    | number
    | string
    | null
  other_expense:
    | number
    | string
    | null
  other_expense_description: string

  notes: string
  record_status: string
  display_order: number

  created_at: string
  updated_at: string
}

type DeleteBusinessRow = {
  deleted_business_id: string
  success: boolean
}

function normalizeRequiredId(
  value: string,
  message: string,
): string {
  const normalizedValue =
    value.trim()

  if (!normalizedValue) {
    throw new Error(message)
  }

  return normalizedValue
}

function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0
  }

  const numericValue =
    Number(value)

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : 0
}

function toNullableNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null
  }

  const numericValue =
    Number(value)

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : null
}

function normalizeString(
  value: string | null | undefined,
): string {
  return value?.trim() ?? ""
}

function normalizeEntityType(
  value: string,
): OrganizerBusinessEntityType {
  return value as
    OrganizerBusinessEntityType
}

function normalizeAccountingMethod(
  value: string,
): OrganizerBusinessAccountingMethod {
  return value as
    OrganizerBusinessAccountingMethod
}

function normalizeRecordStatus(
  value: string,
): OrganizerBusinessRecordStatus {
  return value as
    OrganizerBusinessRecordStatus
}

function mapBusinessResponseRow(
  row: BusinessResponseRow,
): OrganizerBusinessResponse {
  return {
    organizerId:
      row.organizer_id,

    hasBusinessActivity:
      row.has_business_activity,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

function mapBusinessRow(
  row: BusinessRow,
): OrganizerBusiness {
  return {
    id:
      row.id,

    organizerId:
      row.organizer_id,

    businessName:
      normalizeString(
        row.business_name,
      ),

    dbaName:
      normalizeString(
        row.dba_name,
      ),

    entityType:
      normalizeEntityType(
        row.entity_type,
      ),

    employerIdentificationNumber:
      normalizeString(
        row.employer_identification_number,
      ),

    principalBusinessActivity:
      normalizeString(
        row.principal_business_activity,
      ),

    businessCode:
      normalizeString(
        row.business_code,
      ),

    addressLine1:
      normalizeString(
        row.address_line_1,
      ),

    addressLine2:
      normalizeString(
        row.address_line_2,
      ),

    city:
      normalizeString(
        row.city,
      ),

    state:
      normalizeString(
        row.state,
      ),

    postalCode:
      normalizeString(
        row.postal_code,
      ),

    country:
      normalizeString(
        row.country,
      ),

    dateStarted:
      row.date_started,

    dateClosed:
      row.date_closed,

    ownershipPercentage:
      toNullableNumber(
        row.ownership_percentage,
      ),

    accountingMethod:
      normalizeAccountingMethod(
        row.accounting_method,
      ),

    wasActiveDuringTaxYear:
      row.was_active_during_tax_year,

    hasHomeOffice:
      row.has_home_office,

    hasEmployees:
      row.has_employees,

    hasInventory:
      row.has_inventory,

    usesVehicle:
      row.uses_vehicle,

    bookkeepingComplete:
      row.bookkeeping_complete,

    grossReceipts:
      toNumber(
        row.gross_receipts,
      ),

    returnsAndAllowances:
      toNumber(
        row.returns_and_allowances,
      ),

    otherBusinessIncome:
      toNumber(
        row.other_business_income,
      ),

    costOfGoodsSold:
      toNumber(
        row.cost_of_goods_sold,
      ),

    advertisingExpense:
      toNumber(
        row.advertising_expense,
      ),

    carAndTruckExpense:
      toNumber(
        row.car_and_truck_expense,
      ),

    commissionsAndFeesExpense:
      toNumber(
        row.commissions_and_fees_expense,
      ),

    contractLaborExpense:
      toNumber(
        row.contract_labor_expense,
      ),

    depreciationExpense:
      toNumber(
        row.depreciation_expense,
      ),

    employeeBenefitExpense:
      toNumber(
        row.employee_benefit_expense,
      ),

    insuranceExpense:
      toNumber(
        row.insurance_expense,
      ),

    interestExpense:
      toNumber(
        row.interest_expense,
      ),

    legalAndProfessionalExpense:
      toNumber(
        row.legal_and_professional_expense,
      ),

    officeExpense:
      toNumber(
        row.office_expense,
      ),

    pensionAndProfitSharingExpense:
      toNumber(
        row.pension_and_profit_sharing_expense,
      ),

    rentOrLeaseExpense:
      toNumber(
        row.rent_or_lease_expense,
      ),

    repairsAndMaintenanceExpense:
      toNumber(
        row.repairs_and_maintenance_expense,
      ),

    suppliesExpense:
      toNumber(
        row.supplies_expense,
      ),

    taxesAndLicensesExpense:
      toNumber(
        row.taxes_and_licenses_expense,
      ),

    travelExpense:
      toNumber(
        row.travel_expense,
      ),

    deductibleMealsExpense:
      toNumber(
        row.deductible_meals_expense,
      ),

    utilitiesExpense:
      toNumber(
        row.utilities_expense,
      ),

    wagesExpense:
      toNumber(
        row.wages_expense,
      ),

    otherExpense:
      toNumber(
        row.other_expense,
      ),

    otherExpenseDescription:
      normalizeString(
        row.other_expense_description,
      ),

    notes:
      normalizeString(
        row.notes,
      ),

    recordStatus:
      normalizeRecordStatus(
        row.record_status,
      ),

    displayOrder:
      row.display_order,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

function normalizeMoneyValue(
  value: string,
): string | null {
  const normalizedValue =
    value.trim()

  return normalizedValue ||
    null
}

function createBusinessPayload(
  business:
    OrganizerBusinessFormValues,
): Json {
  return {
    business_name:
      business.businessName.trim(),

    dba_name:
      business.dbaName.trim(),

    entity_type:
      business.entityType,

    employer_identification_number:
      business
        .employerIdentificationNumber
        .trim(),

    principal_business_activity:
      business
        .principalBusinessActivity
        .trim(),

    business_code:
      business.businessCode.trim(),

    address_line_1:
      business.addressLine1.trim(),

    address_line_2:
      business.addressLine2.trim(),

    city:
      business.city.trim(),

    state:
      business.state
        .trim()
        .toUpperCase(),

    postal_code:
      business.postalCode.trim(),

    country:
      business.country.trim(),

    date_started:
      business.dateStarted.trim() ||
      null,

    date_closed:
      business.dateClosed.trim() ||
      null,

    ownership_percentage:
      business
        .ownershipPercentage
        .trim() ||
      null,

    accounting_method:
      business.accountingMethod,

    was_active_during_tax_year:
      business
        .wasActiveDuringTaxYear,

    has_home_office:
      business.hasHomeOffice,

    has_employees:
      business.hasEmployees,

    has_inventory:
      business.hasInventory,

    uses_vehicle:
      business.usesVehicle,

    bookkeeping_complete:
      business.bookkeepingComplete,

    gross_receipts:
      normalizeMoneyValue(
        business.grossReceipts,
      ),

    returns_and_allowances:
      normalizeMoneyValue(
        business.returnsAndAllowances,
      ),

    other_business_income:
      normalizeMoneyValue(
        business.otherBusinessIncome,
      ),

    cost_of_goods_sold:
      normalizeMoneyValue(
        business.costOfGoodsSold,
      ),

    advertising_expense:
      normalizeMoneyValue(
        business.advertisingExpense,
      ),

    car_and_truck_expense:
      normalizeMoneyValue(
        business.carAndTruckExpense,
      ),

    commissions_and_fees_expense:
      normalizeMoneyValue(
        business
          .commissionsAndFeesExpense,
      ),

    contract_labor_expense:
      normalizeMoneyValue(
        business.contractLaborExpense,
      ),

    depreciation_expense:
      normalizeMoneyValue(
        business.depreciationExpense,
      ),

    employee_benefit_expense:
      normalizeMoneyValue(
        business
          .employeeBenefitExpense,
      ),

    insurance_expense:
      normalizeMoneyValue(
        business.insuranceExpense,
      ),

    interest_expense:
      normalizeMoneyValue(
        business.interestExpense,
      ),

    legal_and_professional_expense:
      normalizeMoneyValue(
        business
          .legalAndProfessionalExpense,
      ),

    office_expense:
      normalizeMoneyValue(
        business.officeExpense,
      ),

    pension_and_profit_sharing_expense:
      normalizeMoneyValue(
        business
          .pensionAndProfitSharingExpense,
      ),

    rent_or_lease_expense:
      normalizeMoneyValue(
        business.rentOrLeaseExpense,
      ),

    repairs_and_maintenance_expense:
      normalizeMoneyValue(
        business
          .repairsAndMaintenanceExpense,
      ),

    supplies_expense:
      normalizeMoneyValue(
        business.suppliesExpense,
      ),

    taxes_and_licenses_expense:
      normalizeMoneyValue(
        business
          .taxesAndLicensesExpense,
      ),

    travel_expense:
      normalizeMoneyValue(
        business.travelExpense,
      ),

    deductible_meals_expense:
      normalizeMoneyValue(
        business
          .deductibleMealsExpense,
      ),

    utilities_expense:
      normalizeMoneyValue(
        business.utilitiesExpense,
      ),

    wages_expense:
      normalizeMoneyValue(
        business.wagesExpense,
      ),

    other_expense:
      normalizeMoneyValue(
        business.otherExpense,
      ),

    other_expense_description:
      business
        .otherExpenseDescription
        .trim(),

    notes:
      business.notes.trim(),
  }
}

export async function getOrganizerBusinessResponse(
  organizerId: string,
): Promise<OrganizerBusinessResponse> {
  const normalizedOrganizerId =
    normalizeRequiredId(
      organizerId,
      "An organizer identifier is required.",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_organizer_business_response",
    {
      requested_organizer_id:
        normalizedOrganizerId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as unknown as
        BusinessResponseRow[] | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The Business organizer response was not returned.",
    )
  }

  return mapBusinessResponseRow(
    row,
  )
}

export async function saveOrganizerBusinessActivity({
  organizerId,
  hasBusinessActivity,
}: SaveOrganizerBusinessActivityRequest):
Promise<OrganizerBusinessResponse> {
  const normalizedOrganizerId =
    normalizeRequiredId(
      organizerId,
      "An organizer identifier is required.",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "set_client_organizer_business_activity",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_has_business_activity:
        hasBusinessActivity,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as unknown as
        BusinessResponseRow[] | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The Business organizer response was not saved.",
    )
  }

  return mapBusinessResponseRow(
    row,
  )
}

export async function getOrganizerBusinesses(
  organizerId: string,
): Promise<OrganizerBusiness[]> {
  const normalizedOrganizerId =
    normalizeRequiredId(
      organizerId,
      "An organizer identifier is required.",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_organizer_businesses",
    {
      requested_organizer_id:
        normalizedOrganizerId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return (
    data as unknown as
      BusinessRow[] | null
  ?? []).map(
    mapBusinessRow,
  )
}

export async function createOrganizerBusiness({
  organizerId,
  business,
}: SaveOrganizerBusinessRequest):
Promise<OrganizerBusiness> {
  const normalizedOrganizerId =
    normalizeRequiredId(
      organizerId,
      "An organizer identifier is required.",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_client_organizer_business",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_business:
        createBusinessPayload(
          business,
        ),
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as unknown as
        BusinessRow[] | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The Business organizer record was not created.",
    )
  }

  return mapBusinessRow(
    row,
  )
}

export async function updateOrganizerBusiness({
  organizerId,
  businessId,
  business,
}: UpdateOrganizerBusinessRequest):
Promise<OrganizerBusiness> {
  const normalizedOrganizerId =
    normalizeRequiredId(
      organizerId,
      "An organizer identifier is required.",
    )

  const normalizedBusinessId =
    normalizeRequiredId(
      businessId,
      "A business identifier is required.",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "update_client_organizer_business",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_business_id:
        normalizedBusinessId,

      requested_business:
        createBusinessPayload(
          business,
        ),
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as unknown as
        BusinessRow[] | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The Business organizer record was not updated.",
    )
  }

  return mapBusinessRow(
    row,
  )
}

export async function deleteOrganizerBusiness({
  organizerId,
  businessId,
}: DeleteOrganizerBusinessRequest):
Promise<DeleteOrganizerBusinessResult> {
  const normalizedOrganizerId =
    normalizeRequiredId(
      organizerId,
      "An organizer identifier is required.",
    )

  const normalizedBusinessId =
    normalizeRequiredId(
      businessId,
      "A business identifier is required.",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "delete_client_organizer_business",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_business_id:
        normalizedBusinessId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as unknown as
        DeleteBusinessRow[] | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The Business organizer record was not deleted.",
    )
  }

  return {
    deletedBusinessId:
      row.deleted_business_id,

    success:
      row.success,
  }
}

export function createOrganizerBusinessFormValues(
  business: OrganizerBusiness,
): OrganizerBusinessFormValues {
  const formatNumber =
    (
      value: number | null,
    ): string =>
      value === null
        ? ""
        : String(value)

  return {
    businessName:
      business.businessName,

    dbaName:
      business.dbaName,

    entityType:
      business.entityType,

    employerIdentificationNumber:
      business
        .employerIdentificationNumber,

    principalBusinessActivity:
      business
        .principalBusinessActivity,

    businessCode:
      business.businessCode,

    addressLine1:
      business.addressLine1,

    addressLine2:
      business.addressLine2,

    city:
      business.city,

    state:
      business.state,

    postalCode:
      business.postalCode,

    country:
      business.country,

    dateStarted:
      business.dateStarted ?? "",

    dateClosed:
      business.dateClosed ?? "",

    ownershipPercentage:
      formatNumber(
        business.ownershipPercentage,
      ),

    accountingMethod:
      business.accountingMethod,

    wasActiveDuringTaxYear:
      business
        .wasActiveDuringTaxYear,

    hasHomeOffice:
      business.hasHomeOffice,

    hasEmployees:
      business.hasEmployees,

    hasInventory:
      business.hasInventory,

    usesVehicle:
      business.usesVehicle,

    bookkeepingComplete:
      business.bookkeepingComplete,

    grossReceipts:
      formatNumber(
        business.grossReceipts,
      ),

    returnsAndAllowances:
      formatNumber(
        business.returnsAndAllowances,
      ),

    otherBusinessIncome:
      formatNumber(
        business.otherBusinessIncome,
      ),

    costOfGoodsSold:
      formatNumber(
        business.costOfGoodsSold,
      ),

    advertisingExpense:
      formatNumber(
        business.advertisingExpense,
      ),

    carAndTruckExpense:
      formatNumber(
        business.carAndTruckExpense,
      ),

    commissionsAndFeesExpense:
      formatNumber(
        business
          .commissionsAndFeesExpense,
      ),

    contractLaborExpense:
      formatNumber(
        business.contractLaborExpense,
      ),

    depreciationExpense:
      formatNumber(
        business.depreciationExpense,
      ),

    employeeBenefitExpense:
      formatNumber(
        business
          .employeeBenefitExpense,
      ),

    insuranceExpense:
      formatNumber(
        business.insuranceExpense,
      ),

    interestExpense:
      formatNumber(
        business.interestExpense,
      ),

    legalAndProfessionalExpense:
      formatNumber(
        business
          .legalAndProfessionalExpense,
      ),

    officeExpense:
      formatNumber(
        business.officeExpense,
      ),

    pensionAndProfitSharingExpense:
      formatNumber(
        business
          .pensionAndProfitSharingExpense,
      ),

    rentOrLeaseExpense:
      formatNumber(
        business.rentOrLeaseExpense,
      ),

    repairsAndMaintenanceExpense:
      formatNumber(
        business
          .repairsAndMaintenanceExpense,
      ),

    suppliesExpense:
      formatNumber(
        business.suppliesExpense,
      ),

    taxesAndLicensesExpense:
      formatNumber(
        business
          .taxesAndLicensesExpense,
      ),

    travelExpense:
      formatNumber(
        business.travelExpense,
      ),

    deductibleMealsExpense:
      formatNumber(
        business
          .deductibleMealsExpense,
      ),

    utilitiesExpense:
      formatNumber(
        business.utilitiesExpense,
      ),

    wagesExpense:
      formatNumber(
        business.wagesExpense,
      ),

    otherExpense:
      formatNumber(
        business.otherExpense,
      ),

    otherExpenseDescription:
      business
        .otherExpenseDescription,

    notes:
      business.notes,
  }
}
