import type {
  AppRole,
} from "@/features/auth/types/auth.types"

import type {
  Permission,
} from "./permission-types"
import {
  permissions,
} from "./permissions"

const allPermissions =
  Object.values(permissions).flatMap(
    (permissionGroup) =>
      Object.values(permissionGroup),
  )

export const rolePermissions: Record<
  AppRole,
  readonly Permission[]
> = {
  administrator: allPermissions,

  manager: [
    permissions.dashboard.view,
    permissions.dashboard.viewExecutiveData,
    permissions.dashboard.viewReturnReadiness,
    permissions.dashboard.viewPriorityQueue,

    permissions.clients.view,
    permissions.clients.create,
    permissions.clients.edit,

    permissions.returns.view,
    permissions.returns.create,
    permissions.returns.edit,
    permissions.returns.assign,
    permissions.returns.approve,

    permissions.documents.view,
    permissions.documents.upload,
    permissions.documents.delete,

    permissions.payments.view,
    permissions.payments.record,
    permissions.payments.void,

    permissions.reports.view,
    permissions.reports.export,

    permissions.users.view,

    permissions.audit.view,
  ],

  preparer: [
    permissions.dashboard.view,
    permissions.dashboard.viewReturnReadiness,
    permissions.dashboard.viewPriorityQueue,

    permissions.clients.view,
    permissions.clients.edit,

    permissions.returns.view,
    permissions.returns.create,
    permissions.returns.edit,

    permissions.documents.view,
    permissions.documents.upload,

    permissions.payments.view,
    permissions.payments.record,
  ],

  reviewer: [
    permissions.dashboard.view,
    permissions.dashboard.viewReturnReadiness,
    permissions.dashboard.viewPriorityQueue,

    permissions.clients.view,

    permissions.returns.view,
    permissions.returns.edit,
    permissions.returns.approve,

    permissions.documents.view,
    permissions.documents.upload,

    permissions.payments.view,
  ],

  receptionist: [
    permissions.dashboard.view,

    permissions.clients.view,
    permissions.clients.create,
    permissions.clients.edit,

    permissions.returns.view,
    permissions.returns.create,

    permissions.documents.view,
    permissions.documents.upload,

    permissions.payments.view,
    permissions.payments.record,
  ],

  read_only: [
    permissions.dashboard.view,

    permissions.clients.view,

    permissions.returns.view,

    permissions.documents.view,

    permissions.payments.view,
  ],
}