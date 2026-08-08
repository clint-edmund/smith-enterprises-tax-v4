import {
  Check,
  Clipboard,
  Mail,
  MessageSquareText,
  Phone,
  UserRound,
} from "lucide-react"
import {
  useState,
} from "react"

import type {
  ClientRecord,
} from "@/features/clients/types/client.types"

interface ClientCommunicationCenterProps {
  client: ClientRecord
}

type CopiedField =
  | "email"
  | "phone"
  | null

function formatLastUpdated(
  dateValue: string,
): string {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    )

  return formatter.format(date)
}

function formatPhoneForLink(
  phone: string,
): string {
  return phone.replace(/[^\d+]/g, "")
}

export function ClientCommunicationCenter({
  client,
}: ClientCommunicationCenterProps) {
  const [
    copiedField,
    setCopiedField,
  ] = useState<CopiedField>(null)

  const email =
    client.email?.trim() || ""

  const phone =
    client.phone?.trim() || ""

  async function copyValue(
    value: string,
    field: Exclude<
      CopiedField,
      null
    >,
  ) {
    if (!value) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        value,
      )

      setCopiedField(field)

      window.setTimeout(() => {
        setCopiedField(null)
      }, 2000)
    } catch {
      setCopiedField(null)
    }
  }

  return (
    <section
      aria-labelledby="client-communication-center-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <MessageSquareText
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Client Outreach
            </p>

            <h2
              id="client-communication-center-heading"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              Communication Center
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Contact the client and review the communication details on file.
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          {email || phone
            ? "Contact Ready"
            : "Contact Missing"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <a
          href={
            email
              ? `mailto:${email}`
              : undefined
          }
          aria-disabled={!email}
          className={[
            "flex min-h-24 flex-col justify-between rounded-2xl border p-4 transition",
            email
              ? "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"
              : "pointer-events-none border-slate-200 bg-slate-50 opacity-55",
          ].join(" ")}
        >
          <Mail
            className="size-5 text-blue-700"
            aria-hidden="true"
          />

          <div>
            <p className="font-bold text-slate-950">
              Email Client
            </p>

            <p className="mt-1 truncate text-sm text-slate-500">
              {email ||
                "No email address"}
            </p>
          </div>
        </a>

        <a
          href={
            phone
              ? `tel:${formatPhoneForLink(
                  phone,
                )}`
              : undefined
          }
          aria-disabled={!phone}
          className={[
            "flex min-h-24 flex-col justify-between rounded-2xl border p-4 transition",
            phone
              ? "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
              : "pointer-events-none border-slate-200 bg-slate-50 opacity-55",
          ].join(" ")}
        >
          <Phone
            className="size-5 text-emerald-700"
            aria-hidden="true"
          />

          <div>
            <p className="font-bold text-slate-950">
              Call Client
            </p>

            <p className="mt-1 truncate text-sm text-slate-500">
              {phone ||
                "No phone number"}
            </p>
          </div>
        </a>

        <button
          type="button"
          disabled={!email}
          onClick={() =>
            void copyValue(
              email,
              "email",
            )
          }
          className="flex min-h-24 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-55"
        >
          {copiedField ===
          "email" ? (
            <Check
              className="size-5 text-emerald-700"
              aria-hidden="true"
            />
          ) : (
            <Clipboard
              className="size-5 text-violet-700"
              aria-hidden="true"
            />
          )}

          <div>
            <p className="font-bold text-slate-950">
              {copiedField ===
              "email"
                ? "Email Copied"
                : "Copy Email"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Copy to clipboard
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={!phone}
          onClick={() =>
            void copyValue(
              phone,
              "phone",
            )
          }
          className="flex min-h-24 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-55"
        >
          {copiedField ===
          "phone" ? (
            <Check
              className="size-5 text-emerald-700"
              aria-hidden="true"
            />
          ) : (
            <Clipboard
              className="size-5 text-amber-700"
              aria-hidden="true"
            />
          )}

          <div>
            <p className="font-bold text-slate-950">
              {copiedField ===
              "phone"
                ? "Phone Copied"
                : "Copy Phone"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Copy to clipboard
            </p>
          </div>
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <UserRound
              className="size-4"
              aria-hidden="true"
            />

            <p className="text-xs font-semibold uppercase tracking-wide">
              Preferred Contact
            </p>
          </div>

          <p className="mt-3 font-bold text-slate-950">
            {email
              ? "Email"
              : phone
                ? "Phone"
                : "Not available"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Based on the contact information currently on file.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Primary Email
          </p>

          <p className="mt-3 break-all font-bold text-slate-950">
            {email ||
              "Not provided"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Used for digital correspondence.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Last Client Update
          </p>

          <p className="mt-3 font-bold text-slate-950">
            {formatLastUpdated(
              client.updatedAt,
            )}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Most recent change to the client record.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
            <MessageSquareText
              className="size-4"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              Communication activity
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Email, call, text-message, document-request, and signature activity will appear here after communication logging is connected in a future phase.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
