import {
  CircleDollarSign,
  FilePlus2,
  UserPlus,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import type {
  AppRole,
} from "@/features/auth/types/auth.types"

interface QuickActionsProps {
  role: AppRole
}

const recordManagementRoles: AppRole[] = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

const paymentRoles: AppRole[] = [
  "administrator",
  "manager",
  "preparer",
  "receptionist",
]

export function QuickActions({
  role,
}: QuickActionsProps) {
  const canManageRecords =
    recordManagementRoles.includes(role)

  const canManagePayments =
    paymentRoles.includes(role)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="font-bold text-slate-950">
          Quick actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Start common staff tasks
        </p>
      </header>

      <div className="mt-5 space-y-3">
        {canManageRecords && (
          <Link
            to={appConfig.routes.clients}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <UserPlus
              className="size-5 text-blue-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Add or find a client
              </p>

              <p className="text-xs text-slate-500">
                Open client management
              </p>
            </div>
          </Link>
        )}

        {canManageRecords && (
          <Link
            to={appConfig.routes.returns}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <FilePlus2
              className="size-5 text-blue-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Open tax returns
              </p>

              <p className="text-xs text-slate-500">
                Manage return workflows
              </p>
            </div>
          </Link>
        )}

        {canManagePayments && (
          <Link
            to={appConfig.routes.payments}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <CircleDollarSign
              className="size-5 text-blue-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Record a payment
              </p>

              <p className="text-xs text-slate-500">
                Open payment management
              </p>
            </div>
          </Link>
        )}

        {!canManageRecords &&
          !canManagePayments && (
            <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
              Your role currently provides
              read-only access.
            </div>
          )}
      </div>
    </section>
  )
}