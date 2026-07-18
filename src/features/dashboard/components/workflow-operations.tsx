import {
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileClock,
  FilePenLine,
  FolderClock,
  PauseCircle,
  ScanSearch,
  Send,
  Signature,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardWorkflowSummary } from "@/features/dashboard/types/dashboard.types";
import { formatNumber } from "@/features/dashboard/utils/dashboard-formatters";

interface WorkflowOperationsProps {
  workflow: DashboardWorkflowSummary;
}

const workflowItems = [
  {
    key: "intake",
    label: "Intake",
    description: "New returns entering the workflow",
    icon: ClipboardList,
    href: "/returns?workflow=intake",
    classes: "border-slate-200 bg-slate-50 text-slate-800",
    iconClasses: "bg-slate-200 text-slate-700",
  },
  {
    key: "documentsPending",
    label: "Documents Pending",
    description: "Waiting for client documents",
    icon: FolderClock,
    href: "/returns?workflow=documents_pending",
    classes: "border-amber-200 bg-amber-50 text-amber-900",
    iconClasses: "bg-amber-200 text-amber-800",
  },
  {
    key: "readyForPreparation",
    label: "Ready for Preparation",
    description: "Ready to be assigned or prepared",
    icon: FileCheck2,
    href: "/returns?workflow=ready_for_preparation",
    classes: "border-blue-200 bg-blue-50 text-blue-900",
    iconClasses: "bg-blue-200 text-blue-800",
  },
  {
    key: "inPreparation",
    label: "In Preparation",
    description: "Returns currently being prepared",
    icon: FilePenLine,
    href: "/returns?workflow=in_preparation",
    classes: "border-indigo-200 bg-indigo-50 text-indigo-900",
    iconClasses: "bg-indigo-200 text-indigo-800",
  },
  {
    key: "review",
    label: "Review",
    description: "Waiting for or undergoing review",
    icon: ScanSearch,
    href: "/returns?workflow=review",
    classes: "border-violet-200 bg-violet-50 text-violet-900",
    iconClasses: "bg-violet-200 text-violet-800",
  },
  {
    key: "signaturePending",
    label: "Signature Pending",
    description: "Waiting for client signatures",
    icon: Signature,
    href: "/returns?workflow=signature_pending",
    classes: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
    iconClasses: "bg-fuchsia-200 text-fuchsia-800",
  },
  {
    key: "readyToFile",
    label: "Ready to File",
    description: "Approved and ready for filing",
    icon: FileClock,
    href: "/returns?workflow=ready_to_file",
    classes: "border-cyan-200 bg-cyan-50 text-cyan-900",
    iconClasses: "bg-cyan-200 text-cyan-800",
  },
  {
    key: "filed",
    label: "Filed",
    description: "Submitted to the taxing authority",
    icon: Send,
    href: "/returns?workflow=filed",
    classes: "border-sky-200 bg-sky-50 text-sky-900",
    iconClasses: "bg-sky-200 text-sky-800",
  },
  {
    key: "completed",
    label: "Completed",
    description: "Finished workflow items",
    icon: CheckCircle2,
    href: "/returns?workflow=completed",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconClasses: "bg-emerald-200 text-emerald-800",
  },
  {
    key: "onHold",
    label: "On Hold",
    description: "Returns requiring attention",
    icon: PauseCircle,
    href: "/returns?workflow=on_hold",
    classes: "border-red-200 bg-red-50 text-red-900",
    iconClasses: "bg-red-200 text-red-800",
  },
] satisfies Array<{
  key: keyof DashboardWorkflowSummary;
  label: string;
  description: string;
  icon: typeof ClipboardList;
  href: string;
  classes: string;
  iconClasses: string;
}>;

export function WorkflowOperations({
  workflow,
}: WorkflowOperationsProps) {
  const totalWorkflowReturns = Object.values(workflow).reduce(
    (total, count) => total + count,
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
            Workflow Operations
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Return Workflow Queue
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Monitor every return by its current operational workflow stage.
          </p>
        </div>

        <Link
          to="/returns?workflow=all"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
        >
          View All {formatNumber(totalWorkflowReturns)}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {workflowItems.map((item) => {
          const Icon = item.icon;
          const count = workflow[item.key];

          return (
            <Link
              key={item.key}
              to={item.href}
              className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${item.classes}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.iconClasses}`}
                >
                  <Icon className="size-5" />
                </div>

                <span className="text-3xl font-bold tracking-tight">
                  {formatNumber(count)}
                </span>
              </div>

              <h3 className="mt-4 font-semibold">
                {item.label}
              </h3>

              <p className="mt-1 text-xs leading-5 opacity-80">
                {item.description}
              </p>

              <p className="mt-3 text-xs font-semibold opacity-70 transition group-hover:opacity-100">
                Open queue
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}