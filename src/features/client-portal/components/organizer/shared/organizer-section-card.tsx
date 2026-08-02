import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileWarning,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import {
  organizerHealthMetadata,
} from "@/features/client-portal/constants/organizer-health.constants"

import type {
  OrganizerSectionHealth,
} from "@/features/client-portal/types/organizer-health.types"

interface OrganizerSectionCardProps {
  section: OrganizerSectionHealth

  href: string
}

const healthIcons = {
  not_started:
    CircleDashed,

  in_progress:
    Clock3,

  needs_attention:
    AlertTriangle,

  complete:
    CheckCircle2,
} as const

const badgeStyles = {
  not_started:
    "bg-slate-100 text-slate-700",

  in_progress:
    "bg-blue-100 text-blue-700",

  needs_attention:
    "bg-amber-100 text-amber-800",

  complete:
    "bg-emerald-100 text-emerald-800",
} as const

export function OrganizerSectionCard({
  section,
  href,
}: OrganizerSectionCardProps) {
  const metadata =
    organizerHealthMetadata[
      section.healthLevel
    ]

  const Icon =
    healthIcons[
      section.healthLevel
    ]

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="flex items-center gap-3">

              <Icon
                className="h-6 w-6 text-blue-700"
              />

              <h3 className="text-lg font-semibold text-slate-950">
                {section.sectionTitle}
              </h3>

            </div>

            <span
              className={[
                "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                badgeStyles[
                  section.healthLevel
                ],
              ].join(" ")}
            >
              {metadata.label}
            </span>

          </div>

          <Link
            to={href}
            className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>

        </div>

        <div className="mt-6">

          <div className="flex items-center justify-between">

            <span className="text-sm text-slate-600">
              Progress
            </span>

            <span className="font-semibold">
              {section.progressPercentage}%
            </span>

          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-blue-700"
              style={{
                width:
                  `${section.progressPercentage}%`,
              }}
            />

          </div>

        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">

          <div>

            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Records
            </dt>

            <dd className="mt-1 text-xl font-semibold">
              {section.recordCount}
            </dd>

          </div>

          <div>

            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Completed
            </dt>

            <dd className="mt-1 text-xl font-semibold">
              {section.completedRecordCount}
            </dd>

          </div>

          <div>

            <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">

              <FileWarning
                className="h-4 w-4"
              />

              Missing Docs

            </dt>

            <dd className="mt-1 text-xl font-semibold">
              {section.missingDocumentCount}
            </dd>

          </div>

          <div>

            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Issues
            </dt>

            <dd className="mt-1 text-xl font-semibold">
              {section.issueCount}
            </dd>

          </div>

        </dl>

        {section.isReadyForReview ? (

          <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

            ✓ Ready For Review

          </div>

        ) : (

          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">

            Requires Additional Work

          </div>

        )}

      </div>

    </article>
  )
}