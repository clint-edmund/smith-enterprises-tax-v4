import {
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import type {
  OrganizerReviewOverview,
  OrganizerReviewIssue,
} from "../types"

interface OrganizerReviewIssueListProps {
  overview: OrganizerReviewOverview
}

function getIssueIcon(
  severity: OrganizerReviewIssue["severity"],
) {
  switch (severity) {
    case "blocking":
      return (
        <AlertCircle className="h-5 w-5 text-red-600" />
      )

    case "warning":
      return (
        <AlertTriangle className="h-5 w-5 text-amber-600" />
      )

    default:
      return (
        <Info className="h-5 w-5 text-blue-600" />
      )
  }
}

function getBadgeClass(
  severity: OrganizerReviewIssue["severity"],
) {
  switch (severity) {
    case "blocking":
      return "bg-red-100 text-red-800"

    case "warning":
      return "bg-amber-100 text-amber-800"

    default:
      return "bg-blue-100 text-blue-800"
  }
}

export function OrganizerReviewIssueList({
  overview,
}: OrganizerReviewIssueListProps) {
  const issues =
    overview.sections.flatMap(
      (section) => section.issues,
    )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Outstanding Issues
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Resolve these items before beginning return preparation.
        </p>
      </div>

      {issues.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No outstanding issues were found.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {issues.map((issue) => (
            <div
              key={issue.issueId}
              className="flex items-start justify-between gap-4 p-5"
            >
              <div className="flex gap-4">
                {getIssueIcon(
                  issue.severity,
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {issue.title}
                    </h3>

                    <span
                      className={[
                        "rounded-full px-2 py-1 text-xs font-semibold",
                        getBadgeClass(
                          issue.severity,
                        ),
                      ].join(" ")}
                    >
                      {issue.severity}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {issue.description}
                  </p>
                </div>
              </div>

              {issue.actionPath &&
                issue.actionLabel && (
                  <Link
                    to={issue.actionPath}
                    className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {issue.actionLabel}
                  </Link>
                )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}