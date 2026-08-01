import {
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react"

interface OrganizerProgressCardProps {
  taxYear: number

  progress: number

  completedSections: number

  totalSections: number

  currentSectionTitle: string
}

export function OrganizerProgressCard({
  taxYear,
  progress,
  completedSections,
  totalSections,
  currentSectionTitle,
}: OrganizerProgressCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-lg font-semibold text-slate-900">
        {taxYear} Tax Organizer
      </h2>

      <div className="mt-5">

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <p className="mt-2 text-sm font-medium text-slate-700">
          {progress}% Complete
        </p>

      </div>

      <div className="mt-6 space-y-4">

        <div className="flex items-center gap-3">

          <CheckCircle2 className="h-5 w-5 text-emerald-600" />

          <div>

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Completed
            </p>

            <p className="font-semibold">
              {completedSections} / {totalSections}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <FileText className="h-5 w-5 text-blue-600" />

          <div>

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Current
            </p>

            <p className="font-semibold">
              {currentSectionTitle}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Clock3 className="h-5 w-5 text-amber-600" />

          <div>

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Estimated Time Left
            </p>

            <p className="font-semibold">
              Calculating...
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}