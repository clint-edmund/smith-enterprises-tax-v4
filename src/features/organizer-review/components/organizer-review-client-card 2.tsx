import {
  Calendar,
  Mail,
  Phone,
  User,
} from "lucide-react"

import type {
  OrganizerReviewOverview,
} from "../types"

interface OrganizerReviewClientCardProps {
  overview: OrganizerReviewOverview
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

function DetailRow({
  icon,
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="truncate font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

export function OrganizerReviewClientCard({
  overview,
}: OrganizerReviewClientCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Client Information
      </h2>

      <div className="mt-6 space-y-1">
        <DetailRow
          icon={<User className="h-5 w-5" />}
          label="Client"
          value={overview.client.clientName}
        />

        <DetailRow
          icon={<Calendar className="h-5 w-5" />}
          label="Tax Year"
          value={overview.taxYear.toString()}
        />

        <DetailRow
          icon={<Phone className="h-5 w-5" />}
          label="Phone"
          value={
            overview.client.phone ??
            "Not Provided"
          }
        />

        <DetailRow
          icon={<Mail className="h-5 w-5" />}
          label="Email"
          value={
            overview.client.email ??
            "Not Provided"
          }
        />

        <DetailRow
          icon={<User className="h-5 w-5" />}
          label="Client Number"
          value={
            overview.client.clientNumber
          }
        />
      </div>
    </section>
  )
}