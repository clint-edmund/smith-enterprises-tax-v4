import {
  ArrowLeft,
  FilePlus2,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function NewReturnPage() {
  return (
    <section className="space-y-6">
      <header>
        <Link
          to={appConfig.routes.returns}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Tax Returns
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          New Tax Return
        </h1>

        <p className="mt-2 text-slate-600">
          The tax-return creation form will be
          completed in Phase 8.3.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <FilePlus2 className="mx-auto size-12 text-slate-400" />

        <p className="mt-4 font-semibold text-slate-800">
          Return form foundation is ready.
        </p>
      </div>
    </section>
  )
}