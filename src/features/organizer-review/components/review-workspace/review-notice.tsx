import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from "lucide-react"

type ReviewNoticeTone =
  | "success"
  | "error"
  | "warning"
  | "info"

interface ReviewNoticeProps {
  tone: ReviewNoticeTone
  message: string
  title?: string
  onDismiss?: () => void
}

const presentation = {
  success: {
    icon:
      CircleCheck,
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-950",
    defaultTitle:
      "Success",
  },

  error: {
    icon:
      CircleAlert,
    classes:
      "border-red-200 bg-red-50 text-red-950",
    defaultTitle:
      "Unable to complete the action",
  },

  warning: {
    icon:
      TriangleAlert,
    classes:
      "border-amber-200 bg-amber-50 text-amber-950",
    defaultTitle:
      "Attention required",
  },

  info: {
    icon:
      Info,
    classes:
      "border-blue-200 bg-blue-50 text-blue-950",
    defaultTitle:
      "Information",
  },
} as const

export function ReviewNotice({
  tone,
  message,
  title,
  onDismiss,
}: ReviewNoticeProps) {
  const current =
    presentation[
      tone
    ]

  const Icon =
    current.icon

  return (
    <div
      className={[
        "mt-4 flex items-start gap-3 rounded-xl border p-4",
        current.classes,
      ].join(" ")}
      role={
        tone ===
        "error"
          ? "alert"
          : "status"
      }
    >
      <Icon
        className="mt-0.5 h-5 w-5 shrink-0"
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {title ??
            current.defaultTitle}
        </p>

        <p className="mt-1 text-sm leading-6">
          {message}
        </p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={
            onDismiss
          }
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-current"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}
