import { Link } from "react-router-dom";

import type {
  DashboardStaffWorkload,
  DashboardStaffWorkloadItem,
} from "@/features/dashboard/types/dashboard.types";

type StaffWorkloadProps = {
  workload: DashboardStaffWorkload;
};

function formatRole(role: string) {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function WorkloadSummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/60 p-4">
      <p className="text-sm font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

function getCapacityBadge(
  status: DashboardStaffWorkloadItem["capacityStatus"],
) {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300";

    case "moderate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300";

    case "heavy":
      return "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300";

    case "overloaded":
      return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300";
  }
}

function StaffWorkloadRow({ item }: { item: DashboardStaffWorkloadItem }) {
  return (
    <tr className="border-b border-border/70 last:border-b-0">
      <td className="px-4 py-4">
        <div>
          <Link
            to={`/returns?preparer=${item.staffId}`}
            className="font-semibold text-primary hover:text-foreground hover:underline"
          >
            {item.displayName}
          </Link>

          <p className="mt-1 text-xs text-muted-foreground">
            {formatRole(item.role)}
          </p>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        <Link
          to={`/returns?preparer=${item.staffId}`}
          className="font-semibold text-primary hover:text-foreground hover:underline"
        >
          {item.assignedPreparation}
        </Link>
      </td>

      <td className="px-4 py-4 text-center text-sm text-foreground">
        {item.assignedReview}
      </td>

      <td className="px-4 py-4">
        <div className="flex min-w-[150px] flex-col gap-1 text-sm">
          <Link
            to={`/returns?preparer=${item.staffId}&workflow=in_preparation`}
            className="flex items-center justify-between gap-4 text-muted-foreground hover:text-foreground hover:underline"
          >
            <span>In preparation</span>
            <span className="font-semibold text-foreground">
              {item.inPreparation}
            </span>
          </Link>

          <Link
            to={`/returns?preparer=${item.staffId}&workflow=review`}
            className="flex items-center justify-between gap-4 text-muted-foreground hover:text-foreground hover:underline"
          >
            <span>Awaiting review</span>
            <span className="font-semibold text-foreground">
              {item.awaitingReview}
            </span>
          </Link>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        <div className="flex min-w-[125px] flex-col items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            {item.capacityPercentage}%
          </span>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getCapacityBadge(
              item.capacityStatus,
            )}`}
          >
            {item.capacityStatus}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        <span
          className={
            item.overdue > 0
              ? "inline-flex min-w-8 justify-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300"
              : "text-sm text-muted-foreground"
          }
        >
          {item.overdue}
        </span>
      </td>

      <td className="px-4 py-4 text-center">
        <span
          className={
            item.dueNextSevenDays > 0
              ? "inline-flex min-w-8 justify-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
              : "text-sm text-muted-foreground"
          }
        >
          {item.dueNextSevenDays}
        </span>
      </td>

      <td className="px-4 py-4 text-center">
        <span
          className={
            item.onHold > 0
              ? "inline-flex min-w-8 justify-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              : "text-sm text-muted-foreground"
          }
        >
          {item.onHold}
        </span>
      </td>
    </tr>
  );
}

export function StaffWorkload({ workload }: StaffWorkloadProps) {
  return (
    <section className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-border p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Staff Workload
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current preparation, review, deadline, and hold assignments by staff
            member.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <WorkloadSummaryCard
            label="Preparation Assignments"
            value={workload.totalAssignedPreparation}
          />

          <WorkloadSummaryCard
            label="Review Assignments"
            value={workload.totalAssignedReview}
          />

          <WorkloadSummaryCard
            label="Overdue Assignments"
            value={workload.totalOverdue}
          />

          <WorkloadSummaryCard
            label="Returns on Hold"
            value={workload.totalOnHold}
          />
        </div>
      </div>

      {workload.staff.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-medium text-foreground">
            No active staff members were found.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Staff workload information will appear after active preparers or
            reviewers are available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Staff Member
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Prep
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Review
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Active Work
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Capacity
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Overdue
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Due in 7 Days
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  On Hold
                </th>
              </tr>
            </thead>

            <tbody>
              {workload.staff.map((item) => (
                <StaffWorkloadRow key={item.staffId} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
