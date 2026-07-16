import {
  AlertTriangle,
  Check,
  Pause,
} from "lucide-react"

import type {
  ReturnStatus,
} from "@/features/returns/types/return.types"
import {
  getWorkflowStepIndex,
  standardReturnWorkflow,
} from "@/features/returns/utils/return-workflow"

interface ReturnWorkflowProgressProps {
  status: ReturnStatus
}

export function ReturnWorkflowProgress({
  status,
}: ReturnWorkflowProgressProps) {
  const activeIndex =
    getWorkflowStepIndex(status)

  const isRejected =
    status === "rejected"

  const isOnHold =
    status === "on_hold"

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="font-bold text-slate-950">
          Workflow progress
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current preparation and filing stage
        </p>
      </header>

      {(isRejected || isOnHold) && (
        <div
          className={`mt-5 flex gap-3 rounded-xl border p-4 ${
            isRejected
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {isRejected ? (
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <Pause
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
          )}

          <div>
            <p className="font-semibold">
              {isRejected
                ? "Return rejected"
                : "Return on hold"}
            </p>

            <p className="mt-1 text-sm">
              {isRejected
                ? "Review the filing response and correct the return before submitting again."
                : "Work on this return has been temporarily paused."}
            </p>
          </div>
        </div>
      )}

      <ol className="mt-6 space-y-0">
        {standardReturnWorkflow.map(
          (step, index) => {
            const isComplete =
              activeIndex > index

            const isCurrent =
              activeIndex === index

            return (
              <li
                key={step.status}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index <
                  standardReturnWorkflow.length -
                    1 && (
                  <span
                    className={`absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 ${
                      isComplete
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                    aria-hidden="true"
                  />
                )}

                <span
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    isComplete
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : isCurrent
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {isComplete ? (
                    <Check
                      className="size-4"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      {index + 1}
                    </span>
                  )}
                </span>

                <div className="pt-1">
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