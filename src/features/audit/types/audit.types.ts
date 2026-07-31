import type {
  Database,
  Json,
} from "@/types/database.types"

export type AuditLogRow =
  Database["public"]["Tables"]["audit_logs"]["Row"]

export type AuditLogInsert =
  Database["public"]["Tables"]["audit_logs"]["Insert"]

export type AuditLogUpdate =
  Database["public"]["Tables"]["audit_logs"]["Update"]

export type AuditEntityType =
  | "client"
  | "tax_return"
  | "payment"
  | "document"
  | "user"
  | "settings"
  | "security"

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "assigned"
  | "approved"
  | "status_changed"
  | "payment_recorded"
  | "payment_voided"
  | "uploaded"
  | "downloaded"
  | "archived"
  | "restored"
  | "login"
  | "logout"
  | "security_notice_accepted"

export interface CreateAuditLogInput {
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string | null
  actorId?: string | null
  oldValues?: Json | null
  newValues?: Json | null
  metadata?: Json
}