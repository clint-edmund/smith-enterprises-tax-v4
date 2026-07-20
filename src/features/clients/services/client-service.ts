import type {
  ClientFormValues,
  ClientListItem,
  ClientRecord,
  ClientStatus,
} from "@/features/clients/types/client.types"
import { supabase } from "@/services/supabase"

function toNullableString(
  value: string | null | undefined,
): string | undefined {
  const trimmedValue =
    value?.trim()

  return trimmedValue || undefined
}

export async function searchClients(
  search: string,
  status: ClientStatus | "all",
): Promise<ClientListItem[]> {
  const { data, error } = await supabase.rpc(
    "search_clients",
    {
      requested_search:
        search.trim() || undefined,
      requested_status:
        status === "all"
          ? undefined
          : status,
      requested_limit: 100,
    },
  )

  if (error) {
    throw error
  }

  return (data ?? []).map((client) => ({
    id: client.id,
    clientNumber: client.client_number,
    firstName: client.first_name,
    middleName: client.middle_name,
    lastName: client.last_name,
    preferredName: client.preferred_name,
    email: client.email,
    phone: client.phone,
    city: client.city,
    state: client.state,
    status: client.status,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
  }))
}

export async function getClientById(
  clientId: string,
): Promise<ClientRecord | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    clientNumber: data.client_number,
    firstName: data.first_name,
    middleName: data.middle_name,
    lastName: data.last_name,
    preferredName: data.preferred_name,
    email: data.email,
    phone: data.phone,
    alternatePhone: data.alternate_phone,
    addressLine1: data.address_line_1,
    addressLine2: data.address_line_2,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    birthDate: data.birth_date,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function createClient(
  values: ClientFormValues,
): Promise<ClientRecord> {
  const { data, error } = await supabase.rpc(
    "create_client_record",
    {
      requested_first_name:
        values.firstName,
      requested_middle_name:
        toNullableString(values.middleName),
      requested_last_name:
        values.lastName,
      requested_preferred_name:
        toNullableString(values.preferredName),
      requested_email:
        toNullableString(values.email),
      requested_phone:
        toNullableString(values.phone),
      requested_alternate_phone:
        toNullableString(values.alternatePhone),
      requested_address_line_1:
        toNullableString(values.addressLine1),
      requested_address_line_2:
        toNullableString(values.addressLine2),
      requested_city:
        toNullableString(values.city),
      requested_state:
        toNullableString(values.state),
      requested_postal_code:
        toNullableString(values.postalCode),
      requested_birth_date:
        toNullableString(values.birthDate),
      requested_status:
        values.status,
      requested_notes:
        toNullableString(values.notes),
    },
  )

  if (error) {
    throw error
  }

  return {
    id: data.id,
    clientNumber: data.client_number,
    firstName: data.first_name,
    middleName: data.middle_name,
    lastName: data.last_name,
    preferredName: data.preferred_name,
    email: data.email,
    phone: data.phone,
    alternatePhone: data.alternate_phone,
    addressLine1: data.address_line_1,
    addressLine2: data.address_line_2,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    birthDate: data.birth_date,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateClient(
  clientId: string,
  values: ClientFormValues,
): Promise<ClientRecord> {
  const { data, error } = await supabase.rpc(
    "update_client_record",
    {
      requested_client_id: clientId,
      requested_first_name:
        values.firstName,
      requested_middle_name:
        toNullableString(values.middleName),
      requested_last_name:
        values.lastName,
      requested_preferred_name:
        toNullableString(values.preferredName),
      requested_email:
        toNullableString(values.email),
      requested_phone:
        toNullableString(values.phone),
      requested_alternate_phone:
        toNullableString(values.alternatePhone),
      requested_address_line_1:
        toNullableString(values.addressLine1),
      requested_address_line_2:
        toNullableString(values.addressLine2),
      requested_city:
        toNullableString(values.city),
      requested_state:
        toNullableString(values.state),
      requested_postal_code:
        toNullableString(values.postalCode),
      requested_birth_date:
        toNullableString(values.birthDate),
      requested_status:
        values.status,
      requested_notes:
        toNullableString(values.notes),
    },
  )

  if (error) {
    throw error
  }

  return {
    id: data.id,
    clientNumber: data.client_number,
    firstName: data.first_name,
    middleName: data.middle_name,
    lastName: data.last_name,
    preferredName: data.preferred_name,
    email: data.email,
    phone: data.phone,
    alternatePhone: data.alternate_phone,
    addressLine1: data.address_line_1,
    addressLine2: data.address_line_2,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    birthDate: data.birth_date,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}