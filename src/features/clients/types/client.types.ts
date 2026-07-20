import type { Database } from "@/types/database.types"

export type ClientStatus =
  Database["public"]["Enums"]["client_status"]

export interface ClientListItem {
  id: string
  clientNumber: number
  firstName: string
  middleName: string | null
  lastName: string
  preferredName: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  status: ClientStatus
  createdAt: string
  updatedAt: string
}

export interface ClientRecord {
  id: string
  clientNumber: number
  firstName: string
  middleName: string | null
  lastName: string
  preferredName: string | null
  email: string | null
  phone: string | null
  alternatePhone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  birthDate: string | null
  status: ClientStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientFormValues {
  firstName: string
  middleName: string
  lastName: string
  preferredName: string
  email: string
  phone: string
  alternatePhone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  birthDate: string
  status: ClientStatus
  notes: string
}