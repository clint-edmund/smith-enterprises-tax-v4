import {
  AlertTriangle,
  CalendarCheck2,
  CalendarClock,
  ClipboardCheck,
  FileClock,
  FileSearch,
  Files,
  Search,
  ShieldCheck,
  UserCheck,
  UserRoundX,
} from "lucide-react"
import {
  useMemo,
  useState,
} from "react"

import {
  ReportCategorySection,
} from "@/features/reports/components/report-category-section"
import type {
  ReportCategoryDefinition,
  ReportDefinition,
} from "@/features/reports/types/report.types"

const reportCategories: ReportCategoryDefinition[] = [
  {
    id: "operations",
    title: "Operational Reports",
    description:
      "Open live return queues based on workflow status and deadlines.",
  },
  {
    id: "workload",
    title: "Staff Workload Reports",
    description:
      "Review assignments, unassigned work, and personal review queues.",
  },
  {
    id: "management",
    title: "Management Reports",
    description:
      "Use consolidated views for office oversight and follow-up.",
  },
]

const reports: ReportDefinition[] = [
  {
    id: "all-returns",
    title: "All Tax Returns",
    description:
      "Open the complete return register, then refine it by status, tax year, preparer, reviewer, or deadline.",
    category: "management",
    href: "/returns",
    icon: Files,
  },
  {
    id: "documents-pending",
    title: "Documents Pending",
    description:
      "Identify returns that are waiting for client documents or additional intake information.",
    category: "operations",
    href: "/returns?status=documents_pending",
    icon: FileSearch,
  },
  {
    id: "in-progress",
    title: "Returns in Progress",
    description:
      "Review returns that are actively being prepared and have not reached the review stage.",
    category: "operations",
    href: "/returns?status=in_progress",
    icon: FileClock,
  },
  {
    id: "ready-for-review",
    title: "Ready for Review",
    description:
      "Open the quality-review queue for returns that preparers have marked ready.",
    category: "operations",
    href: "/returns?status=ready_for_review",
    icon: ClipboardCheck,
  },
  {
    id: "overdue",
    title: "Overdue Returns",
    description:
      "Find every return with a due date before today so staff can prioritize immediate action.",
    category: "operations",
    href: "/returns?deadline=overdue",
    icon: AlertTriangle,
    badge: "Priority",
  },
  {
    id: "due-today",
    title: "Due Today",
    description:
      "Display returns whose current due date is today.",
    category: "operations",
    href: "/returns?deadline=due_today",
    icon: CalendarCheck2,
  },
  {
    id: "due-this-week",
    title: "Due This Week",
    description:
      "Review upcoming deadlines through the end of the current week.",
    category: "operations",
    href: "/returns?deadline=due_this_week",
    icon: CalendarClock,
  },
  {
    id: "next-seven-days",
    title: "Next Seven Days",
    description:
      "Plan near-term workload by viewing all returns due during the next seven days.",
    category: "management",
    href: "/returns?deadline=next_7_days",
    icon: CalendarClock,
  },
  {
    id: "assigned-to-me",
    title: "Assigned to Me",
    description:
      "Open the signed-in staff member's assigned preparation workload.",
    category: "workload",
    href: "/returns?assignment=mine",
    icon: UserCheck,
  },
  {
    id: "review-assigned-to-me",
    title: "My Review Queue",
    description:
      "Open returns assigned to the signed-in staff member for quality review.",
    category: "workload",
    href: "/returns?reviewer=mine",
    icon: ShieldCheck,
  },
  {
    id: "unassigned-preparer",
    title: "Unassigned Preparation Work",
    description:
      "Find returns that do not yet have an assigned preparer.",
    category: "workload",
    href: "/returns?assignment=unassigned",
    icon: UserRoundX,
    badge: "Manager",
  },
  {
    id: "unassigned-reviewer",
    title: "Unassigned Review Work",
    description:
      "Find returns that do not yet have an assigned reviewer.",
    category: "workload",
    href: "/returns?reviewer=unassigned",
    icon: UserRoundX,
    badge: "Manager",
  },
]

export function ReportsPage() {
  const [searchValue, setSearchValue] =
    useState("")

  const normalizedSearch =
    searchValue.trim().toLowerCase()

  const filteredReports = useMemo(() => {
    if (!normalizedSearch) {
      return reports
    }

    return reports.filter((report) =>
      `${report.title} ${report.description}`
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [normalizedSearch])

  return (
    <section className="space-y-8">
      <header className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
          Reporting Center
        </p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Reports
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Launch live operational and workload reports. Each report opens the Tax Returns register with the correct filters already applied, where it can be exported to CSV or printed.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <label
              htmlFor="report-search"
              className="sr-only"
            >
              Search reports
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <input
                id="report-search"
                type="search"
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value)
                }}
                placeholder="Search reports"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
          </div>
        </div>
      </header>

      {filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <Search className="mx-auto size-8 text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No reports found
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Try a different report name or clear the search field.
          </p>

          <button
            type="button"
            onClick={() => setSearchValue("")}
            className="mt-5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-9">
          {reportCategories.map((category) => (
            <ReportCategorySection
              key={category.id}
              category={category}
              reports={filteredReports.filter(
                (report) => report.category === category.id,
              )}
            />
          ))}
        </div>
      )}

      <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950">
        <p className="font-semibold">
          Export workflow
        </p>

        <p className="mt-1 leading-6 text-blue-900">
          Open a report, confirm or adjust its filters on the Returns page, and then select <strong>Export CSV</strong> or <strong>Print Report</strong>. The exported report uses only the records currently shown.
        </p>
      </aside>
    </section>
  )
}
