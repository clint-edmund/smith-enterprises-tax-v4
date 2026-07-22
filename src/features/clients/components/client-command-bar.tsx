import {
  CreditCard,
  Edit3,
  FilePlus2,
  Mail,
  Printer,
  UploadCloud,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import {
  getClientEditRoute,
  getNewClientReturnRoute,
} from "@/config/app-config"
import type {
  ClientRecord,
} from "@/features/clients/types/client.types"

interface ClientCommandBarProps {
  client: ClientRecord
  canEdit: boolean
}

const primaryActionClasses = [
  "inline-flex items-center justify-center gap-2",
  "rounded-xl bg-blue-700 px-4 py-2.5",
  "text-sm font-semibold text-white",
  "transition hover:bg-blue-800",
  "focus-visible:outline-none focus-visible:ring-4",
  "focus-visible:ring-blue-200",
].join(" ")

const secondaryActionClasses = [
  "inline-flex items-center justify-center gap-2",
  "rounded-xl border border-slate-300 bg-white px-4 py-2.5",
  "text-sm font-semibold text-slate-700",
  "transition hover:border-slate-400 hover:bg-slate-50",
  "focus-visible:outline-none focus-visible:ring-4",
  "focus-visible:ring-slate-200",
].join(" ")

const disabledActionClasses = [
  "inline-flex cursor-not-allowed items-center justify-center gap-2",
  "rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5",
  "text-sm font-semibold text-slate-400",
].join(" ")

export function ClientCommandBar({
  client,
  canEdit,
}: ClientCommandBarProps) {
  const emailHref = client.email
    ? `mailto:${client.email}`
    : undefined

  function handlePrint() {
    window.print()
  }

  return (
    <section
      aria-labelledby="client-actions-heading"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <h2
            id="client-actions-heading"
            className="font-bold text-slate-950"
          >
            Client Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quickly start the most common client workflows.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-5">
        {canEdit && (
          <Link
            to={getNewClientReturnRoute(client.id)}
            className={primaryActionClasses}
          >
            <FilePlus2
              className="size-4"
              aria-hidden="true"
            />
            New Return
          </Link>
        )}

        {canEdit && (
          <Link
            to={getClientEditRoute(client.id)}
            className={secondaryActionClasses}
          >
            <Edit3
              className="size-4"
              aria-hidden="true"
            />
            Edit Client
          </Link>
        )}

        <button
          type="button"
          disabled
          className={disabledActionClasses}
          title="Client-specific payment entry will be enabled in a future phase."
        >
          <CreditCard
            className="size-4"
            aria-hidden="true"
          />
          Record Payment
          <span className="sr-only">
            Coming soon
          </span>
        </button>

        <button
          type="button"
          disabled
          className={disabledActionClasses}
          title="Document uploads will be enabled with the Document Center."
        >
          <UploadCloud
            className="size-4"
            aria-hidden="true"
          />
          Upload Documents
          <span className="sr-only">
            Coming soon
          </span>
        </button>

        {emailHref ? (
          <a
            href={emailHref}
            className={secondaryActionClasses}
          >
            <Mail
              className="size-4"
              aria-hidden="true"
            />
            Email Client
          </a>
        ) : (
          <button
            type="button"
            disabled
            className={disabledActionClasses}
            title="Add an email address to enable this action."
          >
            <Mail
              className="size-4"
              aria-hidden="true"
            />
            Email Client
          </button>
        )}

        <button
          type="button"
          onClick={handlePrint}
          className={secondaryActionClasses}
        >
          <Printer
            className="size-4"
            aria-hidden="true"
          />
          Print Summary
        </button>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
        <p className="text-xs text-slate-500">
          Payment entry and document upload are visible now but remain
          disabled until their secure workflows are completed.
        </p>
      </div>
    </section>
  )
}
