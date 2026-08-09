import type {
  ReactNode,
} from "react"

import {
  AtlasCard,
} from "./atlas-card"

type AtlasSectionVariant =
  | "card"
  | "plain"

interface AtlasSectionProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  variant?: AtlasSectionVariant
}

export function AtlasSection({
  title,
  description,
  eyebrow,
  actions,
  children,
  className = "",
  variant = "card",
}: AtlasSectionProps) {
  const content = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              {eyebrow}
            </p>
          ) : null}

          <h2
            className={
              eyebrow
                ? "mt-2 text-xl font-bold tracking-tight text-slate-950"
                : "text-xl font-bold tracking-tight text-slate-950"
            }
          >
            {title}
          </h2>

          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="shrink-0">
            {actions}
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-5">
        {children}
      </div>
    </>
  )

  if (variant === "plain") {
    return (
      <section
        className={[
          "py-2",
          className,
        ].join(" ")}
      >
        {content}
      </section>
    )
  }

  return (
    <AtlasCard
      className={className}
    >
      {content}
    </AtlasCard>
  )
}