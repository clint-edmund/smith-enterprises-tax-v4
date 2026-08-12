import {
  CircleDollarSign,
  FilePlus2,
  UserPlus,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import {
  useAuthorization,
} from "@/features/authorization/hooks/use-authorization"

export function QuickActions() {
  const {
    hasPermission,
    permissions,
  } = useAuthorization()

  const canCreateClient =
    hasPermission(
      permissions.clients.create,
    )

  const canCreateReturn =
    hasPermission(
      permissions.returns.create,
    )

  const canRecordPayment =
    hasPermission(
      permissions.payments.record,
    )

  const hasQuickActions =
    canCreateClient ||
    canCreateReturn ||
    canRecordPayment

  return (
    <section className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-base font-semibold text-brand-950">
          Quick actions
        </h2>

        <p className="mt-1 text-sm text-brand-500">
          Start common staff tasks
        </p>
      </header>

      <div className="mt-5 space-y-3">
        {canCreateClient && (
          <Link
            to={appConfig.routes.clientNew}
            className="flex items-center gap-3 rounded-xl border border-brand-200 p-4 transition hover:border-brand-400 hover:bg-brand-100"
          >
            <UserPlus
              className="size-5 text-brand-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-brand-900">
                Add a new client
              </p>

              <p className="text-xs text-brand-500">
                Create a taxpayer client record
              </p>
            </div>
          </Link>
        )}

        {canCreateReturn && (
          <Link
            to={appConfig.routes.returnNew}
            className="flex items-center gap-3 rounded-xl border border-brand-200 p-4 transition hover:border-brand-400 hover:bg-brand-100"
          >
            <FilePlus2
              className="size-5 text-brand-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-brand-900">
                Create a tax return
              </p>

              <p className="text-xs text-brand-500">
                Start a client return workflow
              </p>
            </div>
          </Link>
        )}

        {canRecordPayment && (
          <Link
            to={appConfig.routes.payments}
            className="flex items-center gap-3 rounded-xl border border-brand-200 p-4 transition hover:border-brand-400 hover:bg-brand-100"
          >
            <CircleDollarSign
              className="size-5 text-brand-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-brand-900">
                Record a payment
              </p>

              <p className="text-xs text-brand-500">
                Open payment management
              </p>
            </div>
          </Link>
        )}

        {!hasQuickActions && (
          <div className="rounded-xl bg-brand-100 p-4 text-sm text-brand-600">
            Your account does not currently have
            access to staff quick actions.
          </div>
        )}
      </div>
    </section>
  )
}