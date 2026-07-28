import {
  Link,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function ClientRegistrationPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Smith Enterprises
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Create Client Account
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Create an account to begin your secure tax intake.
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            Client registration form coming next.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to={appConfig.routes.clientLogin}
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}