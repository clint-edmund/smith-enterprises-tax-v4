import {
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react"

import type {
  OrganizerNavigationItem,
} from "./organizer-workspace.types"

interface OrganizerNavigationItemProps {
  item: OrganizerNavigationItem
}

export function OrganizerNavigationItem({
  item,
}: OrganizerNavigationItemProps) {
  const icon = item.locked ? (
    <Lock className="h-4 w-4 text-slate-400" />
  ) : item.completed ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  ) : (
    <Circle className="h-4 w-4 text-slate-400" />
  )

  return (
    <button
      type="button"
      disabled={item.locked}
      className={[
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors",
        item.current
          ? "bg-blue-50 text-blue-700"
          : "hover:bg-slate-50",
        item.locked
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {icon}

        <span className="text-sm font-medium">
          {item.title}
        </span>
      </div>

      {item.current && (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  )
}