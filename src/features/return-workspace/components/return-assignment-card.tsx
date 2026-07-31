interface ReturnAssignmentCardProps {
  label: string
  value: string | null
}

export function ReturnAssignmentCard({
  label,
  value,
}: ReturnAssignmentCardProps) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
      "
    >
      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-base
          font-medium
          text-slate-900
        "
      >
        {value ?? "Unassigned"}
      </p>
    </div>
  )
}