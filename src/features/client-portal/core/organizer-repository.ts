import {
  supabase,
} from "@/services/supabase"

import type {
  Database,
} from "@/types/database.types"

type PublicTableName =
  keyof Database["public"]["Tables"]

export class OrganizerRepository {
  static table<
    TableName extends PublicTableName,
  >(
    tableName:
      TableName,
  ) {
    return supabase.from(
      tableName,
    )
  }
}