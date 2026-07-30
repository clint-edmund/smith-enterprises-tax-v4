export type Permission =
  | "dashboard:view"
  | "dashboard:view-executive-data"
  | "dashboard:view-return-readiness"
  | "dashboard:view-priority-queue"

  | "clients:view"
  | "clients:create"
  | "clients:edit"
  | "clients:delete"

  | "returns:view"
  | "returns:create"
  | "returns:edit"
  | "returns:delete"
  | "returns:assign"
  | "returns:approve"

  | "documents:view"
  | "documents:upload"
  | "documents:delete"

  | "payments:view"
  | "payments:record"
  | "payments:void"

  | "reports:view"
  | "reports:export"

  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"

  | "settings:view"
  | "settings:edit"

  | "audit:view"