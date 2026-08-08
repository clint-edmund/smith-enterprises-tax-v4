import {
  Check,
  Pause,
} from "lucide-react"

import type {
  WorkflowStatus,
} from "@/features/workflow/types/workflow.types"

interface WorkflowStep {
  status: WorkflowStatus
  label: string
  description: string
}

const workflowSteps: WorkflowStep[] = [
  {
    status: "intake",
    label: "Intake",
    description:
      "Client information has been received.",
  },
  {
    status: "documents_pending",
    label: "Documents Pending",
    description:
      "Waiting for required tax documents.",
  },
  {
    status: "ready_for_preparation",
    label: "Ready for Preparation",
    description:
      "Everything needed to begin preparing the return has been received.",
  },
  {
    status: "in_preparation",
    label: "In Preparation",
    description:
      "A preparer is actively preparing the return.",
  },
  {
    status: "review",
    label: "Manager Review",
    description:
      "The completed return is being reviewed.",
  },
  {
    status: "signature_pending",
    label: "Awaiting Signature",
    description:
      "Waiting for taxpayer authorization.",
  },
  {
    status: "ready_to_file",
    label: "Ready to File",
    description:
      "Return is approved and ready for electronic filing.",
  },
  {
    status: "filed",
    label: "Filed",
    description:
      "Return has been transmitted to the taxing authority.",
  },
  {
    status: "completed",
    label: "Completed",
    description:
      "Return has been finalized.",
  },
]

interface ReturnWorkflowProgressProps {
  status: WorkflowStatus
}

export function ReturnWorkflowProgress({
  status,
}: ReturnWorkflowProgressProps) {
  const activeIndex =
    workflowSteps.findIndex(
      (step) =>
        step.status === status,
    )

  const isOnHold =
    status === "on_hold"

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="font-bold text-slate-950">
          Office Workflow
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current preparation progress.
        </p>
      </header>

      {isOnHold && (
        <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <Pause
            className="mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />

          <div>
            <p className="font-semibold">
              Return On Hold
            </p>

            <p className="mt-1 text-sm">
              Work on this return has been
              temporarily paused until the
              blocking issue has been resolved.
            </p>
          </div>
        </div>
      )}

      <ol className="mt-6">
        {workflowSteps.map(
          (
            step,
            index,
          ) => {
            const isComplete =
              activeIndex > index

            const isCurrent =
              activeIndex === index

            return (
              <li
                key={step.status}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                {index <
                  workflowSteps.length -
                    1 && (
                  <span
                    className={`absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 ${
                      isComplete
                        ? "bg-emerald-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}

                <span
                  className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 ${
                    isComplete
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : isCurrent
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  {isComplete ? (
                    <Check className="size-4" />
                  ) : (
                    <span className="text-xs font-bold">
                      {index + 1}
                    </span>
                  )}
                </span>

                <div>
                  <p
                    className={`font-semibold ${
                      isCurrent
                        ? "text-blue-800"
                        : isComplete
                          ? "text-emerald-800"
                          : "text-slate-700"
                    }`}
                  >
                    {step.label}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              </li>
            )
          },
        )}
      </ol>
    </section>
  )
}