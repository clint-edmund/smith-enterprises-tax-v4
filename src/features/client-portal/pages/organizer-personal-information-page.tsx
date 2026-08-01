import {
  AlertCircle,
  RefreshCw,
} from "lucide-react"

export function OrganizerPersonalInformationPage() {
  return (
    <section className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Tax Organizer
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Personal Information
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          Review your personal information and make any
          necessary updates before continuing to the next
          organizer section.
        </p>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw
            className="mb-4 h-10 w-10 text-blue-600"
            aria-hidden="true"
          />

          <h2 className="text-2xl font-bold">
            Personal Information
          </h2>

          <p className="mt-4 max-w-xl text-slate-600">
            The secure organizer form will be connected in
            the next phase.
          </p>
        </div>
      </article>

      <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-4">
          <AlertCircle
            className="mt-1 h-6 w-6 shrink-0 text-amber-700"
          />

          <div>
            <h3 className="font-semibold text-amber-900">
              Coming Next
            </h3>

            <p className="mt-2 text-sm text-amber-800">
              This page will automatically load the client's
              information, save drafts, validate required
              fields, and update organizer progress.
            </p>
          </div>
        </div>
      </article>
    </section>
  )
}