import { searchClients } from "@/features/clients/services/client-service";
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
  TaxReturnUpdateResult,
} from "@/features/returns/types/return.types";
import { supabase } from "@/services/supabase";

type NumericDatabaseValue = number | string | null;

interface TaxReturnDatabaseRecord {
  id: string;
  client_id: string;
  tax_year: number;
  return_type: TaxReturnRecord["returnType"];
  tax_form: TaxReturnRecord["taxForm"];
  filing_status: TaxReturnRecord["filingStatus"];
  status: TaxReturnRecord["status"];
  assigned_preparer_id: string | null;
  assigned_reviewer_id: string | null;
  date_received: string | null;
  due_date: string | null;
  filed_date: string | null;
  accepted_date: string | null;
  preparation_fee: NumericDatabaseValue;
  discount_amount: NumericDatabaseValue;
  description: string | null;
  federal_return_required: boolean;
  state_return_required: boolean;
  local_return_required: boolean;
  extension_filed: boolean;
  extension_date: string | null;
  estimated_refund: NumericDatabaseValue;
  estimated_amount_due: NumericDatabaseValue;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function toNumber(value: NumericDatabaseValue): number {
  if (value === null) {
    return 0;
  }

  const convertedValue = Number(value);

  return Number.isFinite(convertedValue) ? convertedValue : 0;
}

function toOptionalString(value: string): string | undefined {
  const trimmedValue = value.trim();

  return trimmedValue === "" ? undefined : trimmedValue;
}

function getRpcRecord<TRecord>(
  data: TRecord | TRecord[] | null,
  missingRecordMessage: string,
): TRecord {
  const record = Array.isArray(data) ? data[0] : data;

  if (!record) {
    throw new Error(missingRecordMessage);
  }

  return record;
}

function mapTaxReturnRecord(
  taxReturn: TaxReturnDatabaseRecord,
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
  };
}

function createReturnRpcArguments(values: TaxReturnFormValues) {
  return {
    requested_client_id: values.clientId,

    requested_tax_year: values.taxYear,

    requested_return_type: values.returnType,

    requested_tax_form: values.taxForm,

    requested_filing_status: values.filingStatus,

    requested_status: values.status,

    requested_assigned_preparer_id: toOptionalString(values.assignedPreparerId),

    requested_assigned_reviewer_id: toOptionalString(values.assignedReviewerId),

    requested_date_received: toOptionalString(values.dateReceived),

    requested_due_date: toOptionalString(values.dueDate),

    requested_filed_date: toOptionalString(values.filedDate),

    requested_accepted_date: toOptionalString(values.acceptedDate),

    requested_preparation_fee: values.preparationFee,

    requested_discount_amount: values.discountAmount,

    requested_description: toOptionalString(values.description),

    requested_federal_return_required: values.federalReturnRequired,

    requested_state_return_required: values.stateReturnRequired,

    requested_local_return_required: values.localReturnRequired,

    requested_extension_filed: values.extensionFiled,

    requested_extension_date: values.extensionFiled
      ? toOptionalString(values.extensionDate)
      : undefined,

    requested_estimated_refund: values.estimatedRefund,

    requested_estimated_amount_due: values.estimatedAmountDue,

    requested_notes: toOptionalString(values.notes),
  };
}

export function getReturnServiceErrorMessage(error: unknown): string {
  let message = "An unexpected tax-return error occurred.";

  if (error instanceof Error) {
    message = error.message;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    message = error.message;
  }

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("workflow transition")) {
    return message;
  }

  if (normalizedMessage.includes("preparer must be assigned")) {
    return "Assign an authorized preparer before moving the return to this workflow status.";
  }

  if (normalizedMessage.includes("reviewer must be assigned")) {
    return "Assign an authorized reviewer before moving the return to this workflow status.";
  }

  if (normalizedMessage.includes("preparer and reviewer must be different")) {
    return "The preparer and reviewer must be different staff members.";
  }

  if (normalizedMessage.includes("selected preparer")) {
    return "The selected preparer is inactive or does not have an authorized preparer role.";
  }

  if (normalizedMessage.includes("selected reviewer")) {
    return "The selected reviewer is inactive or does not have an authorized reviewer role.";
  }

  if (normalizedMessage.includes("discount cannot exceed")) {
    return "The discount cannot exceed the preparation fee.";
  }

  if (normalizedMessage.includes("due date cannot be before")) {
    return "The due date cannot be before the date received.";
  }

  if (normalizedMessage.includes("accepted date cannot be before")) {
    return "The accepted date cannot be before the filed date.";
  }

  if (normalizedMessage.includes("extension date is required")) {
    return "Enter an extension filing date before saving.";
  }

  if (
    normalizedMessage.includes("tax_returns_client_year_type_unique") ||
    normalizedMessage.includes("duplicate key")
  ) {
    return "A return with this client, tax year, and return category already exists.";
  }

  if (normalizedMessage.includes("tax return was not found")) {
    return "The tax return no longer exists or is unavailable.";
  }

  if (
    normalizedMessage.includes("not authorized") ||
    normalizedMessage.includes("permission denied")
  ) {
    return "You are not authorized to perform this tax-return action.";
  }

  return message;
}

export interface SearchTaxReturnsOptions {
  search?: string
  status?: ReturnStatus | "all"
  taxYear?: number | null
  preparerId?: string | null
  limit?: number
}

function normalizeSearchLimit(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return 250
  }

  return Math.min(Math.max(Math.trunc(limit), 1), 250)
}

export async function searchTaxReturns(
  options: SearchTaxReturnsOptions,
): Promise<TaxReturnListItem[]>
export async function searchTaxReturns(
  search: string,
  status: ReturnStatus | "all",
  taxYear: number | null,
  preparerId: string | null,
): Promise<TaxReturnListItem[]>
export async function searchTaxReturns(
  optionsOrSearch: SearchTaxReturnsOptions | string,
  legacyStatus: ReturnStatus | "all" = "all",
  legacyTaxYear: number | null = null,
  legacyPreparerId: string | null = null,
): Promise<TaxReturnListItem[]> {
  const options: SearchTaxReturnsOptions =
    typeof optionsOrSearch === "string"
      ? {
          search: optionsOrSearch,
          status: legacyStatus,
          taxYear: legacyTaxYear,
          preparerId: legacyPreparerId,
        }
      : optionsOrSearch

  const normalizedSearch = options.search?.trim() ?? ""
  const normalizedStatus = options.status ?? "all"
  const normalizedPreparerId = options.preparerId?.trim() || null

  const { data, error } = await supabase.rpc("search_tax_returns", {
    requested_search: normalizedSearch || undefined,
    requested_status:
      normalizedStatus === "all"
        ? undefined
        : normalizedStatus,
    requested_tax_year: options.taxYear ?? undefined,
    requested_preparer_id: normalizedPreparerId ?? undefined,
    requested_limit: normalizeSearchLimit(options.limit),
  })

  if (error) {
    throw new Error(getReturnServiceErrorMessage(error))
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
  const { data, error } = await supabase.rpc("get_client_tax_returns", {
    requested_client_id: clientId,
  });

  if (error) {
    throw error;
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
  }));
}

export async function getReturnStaffOptions(): Promise<ReturnStaffOption[]> {
  const { data, error } = await supabase.rpc("get_return_staff_options");

  if (error) {
    throw error;
  }

  return (data ?? []).map((staff) => ({
    id: staff.id,
    displayName: staff.display_name || staff.email,
    email: staff.email,
    role: staff.role,
  }));
}

export async function getReturnClientOptions(): Promise<ReturnClientOption[]> {
  const clients = await searchClients("", "active");

  return clients.map((client) => ({
    id: client.id,
    clientNumber: client.clientNumber,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    status: client.status,
  }));
}

export async function createTaxReturn(
  values: TaxReturnFormValues,
): Promise<TaxReturnRecord> {
  const { data, error } = await supabase.rpc(
    "create_tax_return_record",
    createReturnRpcArguments(values),
  );

  if (error) {
    throw new Error(getReturnServiceErrorMessage(error));
  }

  const returnRecord = getRpcRecord(
    data,
    "Supabase did not return the created tax return.",
  );

  return mapTaxReturnRecord(returnRecord as TaxReturnDatabaseRecord);
}

export async function updateTaxReturn(
  returnId: string,
  values: TaxReturnFormValues,
): Promise<TaxReturnUpdateResult> {
  if (!returnId.trim()) {
    throw new Error("A tax-return identifier is required.");
  }

  const { data, error } = await supabase.rpc("update_tax_return_record", {
    requested_return_id: returnId,

    ...createReturnRpcArguments(values),
  });

  if (error) {
    throw new Error(getReturnServiceErrorMessage(error));
  }

  const returnRecord = getRpcRecord(
    data,
    "Supabase did not return the updated tax return.",
  );

  return {
    taxReturn: mapTaxReturnRecord(returnRecord as TaxReturnDatabaseRecord),

    message: "The tax return was updated successfully.",
  };
}

export async function getTaxReturnById(
  returnId: string,
): Promise<TaxReturnRecord | null> {
  const { data, error } = await supabase
    .from("tax_returns")
    .select("*")
    .eq("id", returnId)
    .maybeSingle();

  if (error) {
    throw new Error(getReturnServiceErrorMessage(error));
  }

  if (!data) {
    return null;
  }

  return mapTaxReturnRecord(data as TaxReturnDatabaseRecord);
}

export async function getTaxReturnDetails(
  returnId: string,
): Promise<TaxReturnDetails | null> {
  const { data, error } = await supabase.rpc("get_tax_return_details", {
    requested_return_id: returnId,
  });

  if (error) {
    throw new Error(getReturnServiceErrorMessage(error));
  }

  const detailRow = data?.[0];

  if (!detailRow) {
    return null;
  }

  return {
    id: detailRow.id,

    clientId: detailRow.client_id,
    clientNumber: detailRow.client_number ?? 0,
    clientFirstName: detailRow.client_first_name,
    clientMiddleName: detailRow.client_middle_name,
    clientLastName: detailRow.client_last_name,
    clientPreferredName: detailRow.client_preferred_name,
    clientEmail: detailRow.client_email,
    clientPhone: detailRow.client_phone,

    taxYear: detailRow.tax_year,
    returnType: detailRow.return_type,
    taxForm: detailRow.tax_form,
    filingStatus: detailRow.filing_status,
    status: detailRow.status,
    description: detailRow.description,

    assignedPreparerId: detailRow.assigned_preparer_id,
    assignedPreparerName: detailRow.assigned_preparer_name,
    assignedPreparerEmail: detailRow.assigned_preparer_email,

    assignedReviewerId: detailRow.assigned_reviewer_id,
    assignedReviewerName: detailRow.assigned_reviewer_name,
    assignedReviewerEmail: detailRow.assigned_reviewer_email,

    dateReceived: detailRow.date_received,
    dueDate: detailRow.due_date,
    filedDate: detailRow.filed_date,
    acceptedDate: detailRow.accepted_date,

    federalReturnRequired: detailRow.federal_return_required,
    stateReturnRequired: detailRow.state_return_required,
    localReturnRequired: detailRow.local_return_required,

    extensionFiled: detailRow.extension_filed,
    extensionDate: detailRow.extension_date,

    preparationFee: toNumber(detailRow.preparation_fee),
    discountAmount: toNumber(detailRow.discount_amount),
    netFee: toNumber(detailRow.net_fee),

    estimatedRefund: toNumber(detailRow.estimated_refund),
    estimatedAmountDue: toNumber(detailRow.estimated_amount_due),

    notes: detailRow.notes,

    createdAt: detailRow.created_at,
    updatedAt: detailRow.updated_at,
  };
}

export async function getTaxReturnActivity(
  returnId: string,
): Promise<TaxReturnActivity[]> {
  const { data, error } = await supabase.rpc("get_tax_return_activity", {
    requested_return_id: returnId,
    requested_limit: 25,
  });

  if (error) {
    throw new Error(getReturnServiceErrorMessage(error));
  }

  return (data ?? []).map((activity) => ({
    id: Number(activity.id),
    action: activity.action,
    actorId: activity.actor_id,
    actorName: activity.actor_name ?? "System",
    occurredAt: activity.occurred_at,
  }));
}

export async function getTaxReturnDetailData(
  returnId: string,
): Promise<TaxReturnDetailData | null> {
  const taxReturn = await getTaxReturnDetails(returnId);

  if (!taxReturn) {
    return null;
  }

  let activities: TaxReturnActivity[] = [];

  try {
    activities = await getTaxReturnActivity(returnId);
  } catch (error) {
    console.error("Unable to load tax return activity:", error);
  }

  return {
    taxReturn,
    activities,
  };
}
