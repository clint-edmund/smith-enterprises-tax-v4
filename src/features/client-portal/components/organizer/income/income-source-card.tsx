import {
  CheckCircle2,
  FileWarning,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react"

import {
  incomeTypeMetadata,
} from "@/features/client-portal/constants/income.constants"

import type {
  OrganizerIncomeSource,
} from "@/features/client-portal/types/organizer-income.types"

interface IncomeSourceCardProps {
  incomeSource:
    OrganizerIncomeSource

  onEdit: (
    incomeSource:
      OrganizerIncomeSource,
  ) => void

  onDelete: (
    incomeSource:
      OrganizerIncomeSource,
  ) => void
}

const recipientLabels = {
  taxpayer: "Taxpayer",
  spouse: "Spouse",
  dependent: "Dependent",
  joint: "Joint",
} as const

const statusLabels = {
  draft: "Draft",
  complete: "Complete",
  needs_review: "Needs Review",
} as const

const statusClasses = {
  draft:
    "bg-amber-100 text-amber-800",

  complete:
    "bg-emerald-100 text-emerald-800",

  needs_review:
    "bg-red-100 text-red-800",
} as const

function formatUpdatedAt(
  value: string,
): string {
  const parsedDate =
    new Date(value)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    parsedDate,
  )
}

export function IncomeSourceCard({
  incomeSource,
  onEdit,
  onDelete,
}: IncomeSourceCardProps) {
  const metadata =
    incomeTypeMetadata.find(
      (item) =>
        item.type ===
        incomeSource.incomeType,
    )

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-950">
              {
                incomeSource.payerName
              }
            </h3>

            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                statusClasses[
                  incomeSource.recordStatus
                ],
              ].join(" ")}
            >
              {
                statusLabels[
                  incomeSource.recordStatus
                ]
              }
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-blue-700">
            {metadata?.title ??
              incomeSource.incomeType}
          </p>

          {metadata?.description && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {
                metadata.description
              }
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              onEdit(
                incomeSource,
              )
            }}
            className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
            aria-label={`Edit ${incomeSource.payerName}`}
          >
            <Pencil
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => {
              onDelete(
                incomeSource,
              )
            }}
            className="rounded-lg border border-red-200 p-2 text-red-700 transition hover:bg-red-50"
            aria-label={`Delete ${incomeSource.payerName}`}
          >
            <Trash2
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 font-medium text-slate-600">
            <UserRound
              className="h-4 w-4"
              aria-hidden="true"
            />

            Recipient
          </dt>

          <dd className="mt-1 font-semibold text-slate-950">
            {
              recipientLabels[
                incomeSource.recipientType
              ]
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 font-medium text-slate-600">
            {incomeSource.documentReceived ? (
              <CheckCircle2
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              />
            ) : (
              <FileWarning
                className="h-4 w-4 text-amber-600"
                aria-hidden="true"
              />
            )}

            Document
          </dt>

          <dd className="mt-1 font-semibold text-slate-950">
            {incomeSource.documentReceived
              ? "Received"
              : "Not Received"}
          </dd>
        </div>
      </dl>

      {incomeSource.notes && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {
              incomeSource.notes
            }
          </p>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-500">
        Updated{" "}
        {formatUpdatedAt(
          incomeSource.updatedAt,
        )}
      </p>
    </article>
  )
}