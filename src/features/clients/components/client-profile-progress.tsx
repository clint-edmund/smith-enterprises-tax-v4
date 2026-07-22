import {
  CheckCircle2,
  Circle,
  UserRoundCheck,
} from "lucide-react"

import type {
  ClientRecord,
} from "@/features/clients/types/client.types"

interface ClientProfileProgressProps {
  client: ClientRecord
}

interface ProfileItem {
  label: string
  complete: boolean
}

function getProfileItems(
  client: ClientRecord,
): ProfileItem[] {
  const hasMailingAddress =
    Boolean(client.addressLine1) &&
    Boolean(client.city) &&
    Boolean(client.state) &&
    Boolean(client.postalCode)

  return [
    {
      label: "Client name",
      complete:
        Boolean(client.firstName) &&
        Boolean(client.lastName),
    },
    {
      label: "Email address",
      complete: Boolean(client.email),
    },
    {
      label: "Primary phone",
      complete: Boolean(client.phone),
    },
    {
      label: "Mailing address",
      complete: hasMailingAddress,
    },
    {
      label: "Birth date",
      complete: Boolean(client.birthDate),
    },
    {
      label: "Internal notes",
      complete: Boolean(client.notes),
    },
  ]
}

export function ClientProfileProgress({
  client,
}: ClientProfileProgressProps) {
  const items =
    getProfileItems(client)

  const completedCount =
    items.filter(
      (item) => item.complete,
    ).length

  const percentage =
    Math.round(
      (completedCount / items.length) *
        100,
    )

  const progressLabel =
    percentage === 100
      ? "Complete"
      : percentage >= 75
        ? "Nearly Complete"
        : percentage >= 50
          ? "In Progress"
          : "Needs Attention"

  return (
    <section
      aria-labelledby="client-profile-progress-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <UserRoundCheck
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Profile Completion
            </p>

            <h2
              id="client-profile-progress-heading"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              {percentage}% Complete
            </h2>
          </div>
        </div>

        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          {progressLabel}
        </span>
      </div>

      <div className="mt-5">
        <div
          className="h-3 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          aria-label={`Client profile is ${percentage}% complete`}
        >
          <div
            className={[
              "h-full rounded-full transition-all",
              percentage === 100
                ? "bg-emerald-600"
                : percentage >= 75
                  ? "bg-blue-600"
                  : percentage >= 50
                    ? "bg-amber-500"
                    : "bg-red-500",
            ].join(" ")}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {completedCount} of {items.length} profile sections completed.
        </p>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon =
            item.complete
              ? CheckCircle2
              : Circle

          return (
            <li
              key={item.label}
              className={[
                "flex items-center gap-3 rounded-2xl border p-3 text-sm font-medium",
                item.complete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-slate-50 text-slate-600",
              ].join(" ")}
            >
              <Icon
                className={[
                  "size-4 shrink-0",
                  item.complete
                    ? "text-emerald-600"
                    : "text-slate-400",
                ].join(" ")}
                aria-hidden="true"
              />

              <span>{item.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
