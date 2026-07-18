import type {
  DashboardStaffWorkload,
  DashboardStaffWorkloadItem,
} from "@/features/dashboard/types/dashboard.types"

type StaffWorkloadProps = {
  workload: DashboardStaffWorkload
}

function formatRole(role: string) {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    )
}

function WorkloadSummaryCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}

function StaffWorkloadRow({
  item,
}: {
  item: DashboardStaffWorkloadItem
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-4">
        <div>
          <p className="font-semibold text-slate-900">
            {item.displayName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatRole(item.role)}
          </p>
        </div>
      </td>

      <td className="px-4 py-4 text-center text-sm text-slate-700">
        {item.assignedPreparation}
      </td>

      <td className="px-4 py-4 text-center text-sm text-slate-700">
        {item.assignedReview}
      </td>

      <td className="px-4 py-4 text-center text-sm text-slate-700">
        {item.inPreparation}
      </td>

      <td className="px-4 py-4 text-center text-sm text-slate-700">
        {item.awaitingReview}
      </td>

      <td className="px-4 py-4 text-center">
        <span
          className={
            item.overdue > 0
              ? "inline-flex min-w-8 justify-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
              : "text-sm text-slate-500"
          }
        >
          {item.overdue}
        </span>
      </td>

      <td className="px-4 py-4 text-center">
        <span
          className={
            item.dueNextSevenDays > 0
              ? "inline-flex min-w-8 justify-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
              : "text-sm text-slate-500"
          }
        >
          {item.dueNextSevenDays}
        </span>
      </td>

      <td className="px-4 py-4 text-center">
        <span
          className={
            item.onHold > 0
              ? "inline-flex min-w-8 justify-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
              : "text-sm text-slate-500"
          }
        >
          {item.onHold}
        </span>
      </td>
    </tr>
  )
}

export function StaffWorkload({
  workload,
}: StaffWorkloadProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Staff Workload
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Current preparation, review, deadline, and hold
            assignments by staff member.
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
          <p className="font-medium text-slate-700">
            No active staff members were found.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Staff workload information will appear after
            active preparers or reviewers are available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Staff Member
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Preparation
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Review
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  In Preparation
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Awaiting Review
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Overdue
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Due in 7 Days
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  On Hold
                </th>
              </tr>
            </thead>

            <tbody>
              {workload.staff.map((item) => (
                <StaffWorkloadRow
                  key={item.staffId}
                  item={item}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}