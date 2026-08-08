interface OrganizerProgressBarProps {
  progress: number
  label?: string
}

export function OrganizerProgressBar({
  progress,
  label = "Overall Progress",
}: OrganizerProgressBarProps) {
  const normalizedProgress =
    Math.min(
      Math.max(progress, 0),
      100,
    )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {label}
        </p>

        <span className="text-sm font-bold text-slate-900">
          {normalizedProgress}%
        </span>
      </div>

      <div
        className="h-3 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedProgress}
      >
        <div
          className="h-full rounded-full bg-blue-700 transition-all duration-300"
          style={{
            width: `${normalizedProgress}%`,
          }}
        />
      </div>
    </div>
  )
}