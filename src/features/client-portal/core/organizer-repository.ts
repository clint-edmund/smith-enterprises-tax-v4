import {
  supabase,
} from "@/services/supabase"

import type {
  Database,
} from "@/types/database.types"

type PublicTableName =
  keyof Database["public"]["Tables"]

export class OrganizerRepository {
  static query<
    TableName extends PublicTableName,
  >(
    tableName: TableName,
  ) {
    return supabase.from(
      tableName,
    )
  }
}

export async function getOrganizerHealthcareCoverageById(
  coverageId: string,
) {
  const normalizedCoverageId =
    coverageId.trim()

  if (!normalizedCoverageId) {
    throw new Error(
      "A healthcare coverage identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await OrganizerRepository
    .query(
      "client_tax_organizer_healthcare_coverages",
    )
    .select("*")
    .eq(
      "id",
      normalizedCoverageId,
    )
    .single()

  if (error) {
    throw error
  }

  return data
}