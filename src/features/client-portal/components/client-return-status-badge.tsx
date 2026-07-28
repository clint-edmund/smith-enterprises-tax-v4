import { Badge } from "@/components/ui/badge"

interface Props {
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  Draft:
    "bg-slate-100 text-slate-700",

  Received:
    "bg-blue-100 text-blue-700",

  "In Preparation":
    "bg-amber-100 text-amber-700",

  Review:
    "bg-purple-100 text-purple-700",

  Completed:
    "bg-emerald-100 text-emerald-700",

  Filed:
    "bg-green-100 text-green-700",

  Accepted:
    "bg-green-100 text-green-700",

  Rejected:
    "bg-red-100 text-red-700",

  Cancelled:
    "bg-red-100 text-red-700",

  "On Hold":
    "bg-orange-100 text-orange-700",
}

export function ClientReturnStatusBadge({
  status,
}: Props) {
  return (
    <Badge
      className={
        STATUS_STYLES[status] ??
        "bg-slate-100 text-slate-700"
      }
    >
      {status}
    </Badge>
  )
}