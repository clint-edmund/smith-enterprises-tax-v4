import {
  ArrowLeft,
  FileText,
  ShieldCheck,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import {
  appConfig,
} from "@/config/app-config"

export function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-slate-950 px-6 py-8 text-white sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
              <FileText
                className="size-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
                {appConfig.business.name}
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Terms of Service
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-300">
            These terms describe the conditions for using the Smith Enterprises
            secure client portal.
          </p>
        </header>

        <article className="space-y-8 p-6 sm:p-10">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-900">
              Draft policy notice
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              This page is an implementation placeholder and must be replaced
              with legal language reviewed and approved for production use.
            </p>
          </div>

          <PolicySection
            title="Portal Use"
            description="The client portal is provided for authorized clients to exchange information, complete tax-intake activities, review status, and access approved documents."
          />

          <PolicySection
            title="Account Security"
            description="Clients are responsible for protecting their credentials, using a unique password, and reporting suspected unauthorized access promptly."
          />

          <PolicySection
            title="Accurate Information"
            description="Clients must provide complete and accurate information and notify Smith Enterprises when submitted information changes or requires correction."
          />

          <PolicySection
            title="Acceptable Use"
            description="The portal may not be used for unlawful activity, unauthorized access, disruption, impersonation, or submission of malicious content."
          />

          <PolicySection
            title="Electronic Communications"
            description="Portal notices, acknowledgments, and approved electronic communications may be delivered through the portal or the email address associated with the account."
          />

          <PolicySection
            title="Service Availability"
            description="Portal availability may be interrupted for maintenance, security response, system upgrades, or circumstances outside reasonable control."
          />

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-blue-700"
                aria-hidden="true"
              />

              <p className="text-sm leading-6 text-blue-900">
                Do not send Social Security numbers, bank information, or tax
                documents through ordinary email. Use the secure portal.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <Link
              to={appConfig.routes.clientRegister}
              className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
            >
              <ArrowLeft
                className="size-4"
                aria-hidden="true"
              />

              Return to account setup
            </Link>
          </div>
        </article>
      </div>
    </main>
  )
}

interface PolicySectionProps {
  title: string
  description: string
}

function PolicySection({
  title,
  description,
}: PolicySectionProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-7 text-slate-600">
        {description}
      </p>
    </section>
  )
}
