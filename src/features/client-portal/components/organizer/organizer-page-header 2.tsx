import type {
  ReactNode,
} from "react"

interface OrganizerPageHeaderProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function OrganizerPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: OrganizerPageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          {eyebrow}
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600 leading-7">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex shrink-0 items-start">
          {actions}
        </div>
      )}
    </header>
  )
}