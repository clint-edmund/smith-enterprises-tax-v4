import {
  ArrowLeft,
  Edit3,
} from "lucide-react"
import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom"

import {
  appConfig,
  getReturnDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

const editRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

export function EditReturnPage() {
  const { returnId } = useParams()
  const { profile } = useAuth()

  if (
    !profile ||
    !editRoles.includes(profile.role)
  ) {
    return (
      <Navigate
        to={appConfig.routes.returns}
        replace
      />
    )
  }

  if (!returnId) {
    return (
      <Navigate
        to={appConfig.routes.returns}
        replace
      />
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <Link
          to={getReturnDetailsRoute(
            returnId,
          )}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Return
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          Edit Tax Return
        </h1>

        <p className="mt-2 text-slate-600">
          The complete tax-return editing form will
          be added in Phase 8.5.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <Edit3 className="mx-auto size-12 text-slate-400" />

        <p className="mt-4 font-semibold text-slate-800">
          Edit workflow foundation is ready.
        </p>
      </div>
    </section>
  )
}