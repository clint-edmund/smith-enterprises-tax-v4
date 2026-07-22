import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  UserRoundCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardWorkload } from "@/features/dashboard/types/dashboard.types";
import { formatNumber } from "@/features/dashboard/utils/dashboard-formatters";

type MyWorkloadProps = {
  workload: DashboardWorkload;
};

const workloadItems = [
  {
    key: "assignedToMe" as const,
    label: "Assigned to Me",
    description: "Open returns where you are the preparer",
    href: "/returns?assignment=mine",
    icon: UserRoundCheck,
  },
  {
    key: "reviewAssignedToMe" as const,
    label: "My Reviews",
    description: "Returns assigned to you for review",
    href: "/returns?reviewer=mine",
    icon: ClipboardCheck,
  },
  {
    key: "dueToday" as const,
    label: "Due Today",
    description: "Open assigned returns due today",
    href: "/returns?assignment=mine&deadline=due_today",
    icon: CalendarDays,
  },
  {
    key: "dueThisWeek" as const,
    label: "Due This Week",
    description: "Open assigned returns due this week",
    href: "/returns?assignment=mine&deadline=due_this_week",
    icon: CalendarRange,
  },
  {
    key: "overdue" as const,
    label: "My Overdue Returns",
    description: "Open assigned returns past their due date",
    href: "/returns?assignment=mine&deadline=overdue",
    icon: AlertTriangle,
  },
];

export function MyWorkload({ workload }: MyWorkloadProps) {
  return (
    <section className="rounded-2xl border border-brand-200 bg-white p-6 shadow-[0_10px_30px_rgba(33,31,28,0.06)]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-800">
          Personal Queue
        </p>
        <h2 className="mt-1 text-xl font-bold text-brand-950">My Workload</h2>
        <p className="mt-2 text-sm text-brand-600">
          Open a focused return list without rebuilding filters manually.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {workloadItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              to={item.href}
              className="group rounded-xl border border-brand-200 p-4 transition hover:border-brand-400 hover:bg-brand-100/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 transition group-hover:bg-brand-200 group-hover:text-brand-800">
                  <Icon className="size-5" aria-hidden="true" />
                </div>

                <span className="text-2xl font-bold text-brand-950">
                  {formatNumber(workload[item.key])}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-brand-900">
                {item.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-500">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
