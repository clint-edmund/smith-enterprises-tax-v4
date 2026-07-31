import { supabase } from "@/services/supabase"

import type {
  AuditLogRow,
  CreateAuditLogInput,
} from "@/features/audit/types/audit.types"

export async function createAuditLog(
  input: CreateAuditLogInput,
): Promise<AuditLogRow> {
  const {
    data,
    error,
  } = await supabase
    .from("audit_logs")
    .insert({
      action: input.action,
      actor_id: input.actorId ?? null,
      entity_id: input.entityId ?? null,
      entity_type: input.entityType,
      metadata: input.metadata ?? {},
      new_values: input.newValues ?? null,
      old_values: input.oldValues ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(
      `Unable to create audit log: ${error.message}`,
    )
  }

  return data
}

export async function getAuditLogs(
  limit = 100,
): Promise<AuditLogRow[]> {
  const {
    data,
    error,
  } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit)

  if (error) {
    throw new Error(
      `Unable to load audit logs: ${error.message}`,
    )
  }

  return data ?? []
}

export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
): Promise<AuditLogRow[]> {
  const {
    data,
    error,
  } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    throw new Error(
      `Unable to load entity audit logs: ${error.message}`,
    )
  }

  return data ?? []
}