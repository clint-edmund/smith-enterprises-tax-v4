import {
  ChevronRight,
} from "lucide-react"

import { Link } from "react-router-dom"

import type {
  OrganizerReviewOverview,
} from "../types"

interface OrganizerReviewSectionListProps {
  overview: OrganizerReviewOverview
}

function getStatusColor(
  healthLevel: string,
) {
  switch (healthLevel) {
    case "complete":
      return "bg-emerald-500"

    case "needs_attention":
      return "bg-amber-500"

    case "in_progress":
      return "bg-blue-500"

    default:
      return "bg-slate-300"
  }
}

export function OrganizerReviewSectionList({
  overview,
}: OrganizerReviewSectionListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Organizer Sections
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Select a section to review the
          information entered by the client.
        </p>
      </div>

      <div>
        {overview.sections.map(
          (section) => (
            <Link
              key={
                section.sectionKey
              }
              to="#"
              className="flex items-center justify-between border-b border-slate-100 p-5 transition hover:bg-slate-50 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div
                  className={[
                    "h-3 w-3 rounded-full",
                    getStatusColor(
                      section.healthLevel,
                    ),
                  ].join(" ")}
                />

                <div>
                  <p className="font-semibold text-slate-900">
                    {
                      section.sectionTitle
                    }
                  </p>

                  <p className="text-sm text-slate-500">
                    {
                      section.progressPercentage
                    }
                    % Complete
                  </p>
                </div>
              </div>

              <ChevronRight
                className="h-5 w-5 text-slate-400"
              />
            </Link>
          ),
        )}
      </div>
    </section>
  )
}