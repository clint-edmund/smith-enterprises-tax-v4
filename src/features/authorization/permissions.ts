import type {
  Permission,
} from "./permission-types"

export const permissions = {
  dashboard: {
    view: "dashboard:view",
    viewExecutiveData:
      "dashboard:view-executive-data",
    viewReturnReadiness:
      "dashboard:view-return-readiness",
    viewPriorityQueue:
      "dashboard:view-priority-queue",
  },

  clients: {
    view: "clients:view",
    create: "clients:create",
    edit: "clients:edit",
    delete: "clients:delete",
  },

  returns: {
    view: "returns:view",
    create: "returns:create",
    edit: "returns:edit",
    delete: "returns:delete",
    assign: "returns:assign",
    approve: "returns:approve",
  },

  documents: {
    view: "documents:view",
    upload: "documents:upload",
    delete: "documents:delete",
  },

  payments: {
    view: "payments:view",
    record: "payments:record",
    void: "payments:void",
  },

  reports: {
    view: "reports:view",
    export: "reports:export",
  },

  notifications: {
    view: "notifications:view",
    manage: "notifications:manage",
  },

  users: {
    view: "users:view",
    create: "users:create",
    edit: "users:edit",
    delete: "users:delete",
  },

  settings: {
    view: "settings:view",
    edit: "settings:edit",
  },

  audit: {
    view: "audit:view",
  },
} as const satisfies Record<
  string,
  Record<string, Permission>
>