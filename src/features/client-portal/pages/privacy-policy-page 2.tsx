import {
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import {
  appConfig,
} from "@/config/app-config"

export function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-slate-950 px-6 py-8 text-white sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
              <LockKeyhole
                className="size-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
                {appConfig.business.name}
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Privacy Policy
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-300">
            This page explains how information submitted through the secure
            client portal is handled.
          </p>
        </header>

        <article className="space-y-8 p-6 sm:p-10">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-900">
              Draft policy notice
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              This page is an implementation placeholder and must be replaced
              with privacy language reviewed and approved for production use.
            </p>
          </div>

          <PolicySection
            title="Information Collected"
            description="The portal may collect contact information, identity information, tax-organizer responses, uploaded documents, payment-related details, signatures, and account activity."
          />

          <PolicySection
            title="How Information Is Used"
            description="Information is used to provide tax-preparation services, verify identity, communicate securely, prepare and review returns, fulfill legal obligations, and protect the portal."
          />

          <PolicySection
            title="Restricted Information"
            description="Sensitive values such as Social Security numbers, driver's-license numbers, and bank information are intended to be stored and accessed through controlled security workflows."
          />

          <PolicySection
            title="Access and Disclosure"
            description="Access should be limited to authorized personnel and approved service providers with a legitimate business or legal need."
          />

          <PolicySection
            title="Retention"
            description="Information may be retained according to applicable legal, regulatory, contractual, security, and business requirements."
          />

          <PolicySection
            title="Security"
            description="Administrative, technical, and organizational safeguards are used to reduce the risk of unauthorized access, alteration, disclosure, or loss."
          />

          <PolicySection
            title="Client Responsibilities"
            description="Clients should protect account credentials, use trusted devices, review submitted information, and report suspected unauthorized access."
          />

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-blue-700"
                aria-hidden="true"
              />

              <p className="text-sm leading-6 text-blue-900">
                Restricted taxpayer information should be submitted only
                through approved secure workflows, never through ordinary
                email.
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
