import type {
  PropsWithChildren,
} from "react"

interface OrganizerSectionProps
  extends PropsWithChildren {
  title: string
  description?: string
}

export function OrganizerSection({
  title,
  description,
  children,
}: OrganizerSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {children}
      </div>
    </section>
  )
}