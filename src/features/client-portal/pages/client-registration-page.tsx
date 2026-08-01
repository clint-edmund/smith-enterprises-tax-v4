import {
  Link,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function ClientRegistrationPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
  <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

    <header className="bg-slate-950 px-8 py-8 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
        Smith Enterprises
      </p>

      <h1 className="mt-2 text-3xl font-bold">
        Create Your Secure Portal Account
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
        Complete your secure account setup to begin your tax organizer and
        safely exchange documents with your tax preparation team.
      </p>
    </header>

    <div className="space-y-8 p-8">

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-bold text-slate-950">
          Invitation
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your secure invitation has been validated. In the next step,
          you'll create your portal password and activate your account.
        </p>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="font-bold text-blue-900">
          Your information is protected
        </h2>

        <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-800">
          <li>• Bank-level encrypted communication</li>
          <li>• Secure document exchange</li>
          <li>• No Social Security numbers sent through email</li>
          <li>• Automatic session protection</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Account Setup
        </h2>

        <p className="mt-3 text-sm text-slate-600">
          Password creation and account activation will be added in the
          next phase.
        </p>
      </section>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          to={appConfig.routes.clientLogin}
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          Sign in
        </Link>
      </p>

    </div>
  </div>
</section>
  )
}