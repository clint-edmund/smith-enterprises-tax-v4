import {
  workflowStatusOptions,
} from "../constants/workflow-statuses"

import type {
  WorkflowStatus,
} from "../types/workflow.types"

interface WorkflowStatusSelectProps {
  id?: string
  value: WorkflowStatus
  onChange: (
    status: WorkflowStatus,
  ) => void
  disabled?: boolean
}

export function WorkflowStatusSelect({
  id,
  value,
  onChange,
  disabled = false,
}: WorkflowStatusSelectProps) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => {
        onChange(
          event.target
            .value as WorkflowStatus,
        )
      }}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      {workflowStatusOptions.map(
        (option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ),
      )}
    </select>
  )
}