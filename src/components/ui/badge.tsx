import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

type BadgeProps = HTMLAttributes<HTMLDivElement>

export function Badge({
  className,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
      {...props}
    />
  )
}