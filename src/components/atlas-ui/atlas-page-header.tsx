import type {
  ReactNode,
} from "react"

interface AtlasPageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  metadata?: ReactNode
  actions?: ReactNode
  className?: string
}

export function AtlasPageHeader({
  title,
  description,
  eyebrow,
  metadata,
  actions,
  className = "",
}: AtlasPageHeaderProps) {
  return (
    <header
      className={[
        "flex flex-col gap-5 rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:flex-row sm:items-start sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={
            eyebrow
              ? "mt-2 text-3xl font-bold tracking-tight"
              : "text-3xl font-bold tracking-tight"
          }
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            {description}
          </p>
        ) : null}

        {metadata ? (
          <div className="mt-3 text-xs text-slate-400">
            {metadata}
          </div>
        ) : null}
      </div>

      {actions ? (
        <div className="shrink-0">
          {actions}
        </div>
      ) : null}
    </header>
  )
}