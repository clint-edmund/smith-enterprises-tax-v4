import type {
  PropsWithChildren,
} from "react"

interface OrganizerCardProps
  extends PropsWithChildren {
  className?: string
}

export function OrganizerCard({
  children,
  className = "",
}: OrganizerCardProps) {
  return (
    <section
      className={[
        "rounded-2xl",
        "border",
        "border-slate-200",
        "bg-white",
        "shadow-sm",
        "transition-shadow",
        "hover:shadow-md",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  )
}