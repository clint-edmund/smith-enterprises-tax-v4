import type {
  HTMLAttributes,
  ReactNode,
} from "react"

type AtlasCardPadding =
  | "none"
  | "sm"
  | "md"
  | "lg"

interface AtlasCardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: AtlasCardPadding
  elevated?: boolean
}

const paddingClasses: Record<
  AtlasCardPadding,
  string
> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
}

export function AtlasCard({
  children,
  padding = "lg",
  elevated = false,
  className = "",
  ...props
}: AtlasCardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-200 bg-white",
        elevated
          ? "shadow-md"
          : "shadow-sm",
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  )
}