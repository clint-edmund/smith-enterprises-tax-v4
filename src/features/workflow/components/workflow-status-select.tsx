import { workflowStatusOptions } from "../constants/workflow-statuses"
import type { WorkflowStatus } from "../types/workflow.types"

interface WorkflowStatusSelectProps {
  value: WorkflowStatus
  disabled?: boolean
  onChange: (status: WorkflowStatus) => void
}

export function WorkflowStatusSelect({
  value,
  disabled = false,
  onChange,
}: WorkflowStatusSelectProps) {
  return (
    <div>
      <label
        htmlFor="workflow-status"
        className="block text-sm font-medium text-slate-700"
      >
        Workflow Status
      </label>

      <select
        id="workflow-status"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(
            event.target.value as WorkflowStatus,
          )
        }}
        className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      >
        {workflowStatusOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}