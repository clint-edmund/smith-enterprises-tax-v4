import type {
  ReactNode,
} from "react"

interface OrganizerSectionCardProps {
  title: string

  description?: string

  icon?: ReactNode

  status?: ReactNode

  children: ReactNode

  footer?: ReactNode

  className?: string

  contentClassName?: string
}

export function OrganizerSectionCard({
  title,
  description,
  icon,
  status,
  children,
  footer,
  className = "",
  contentClassName = "",
}: OrganizerSectionCardProps) {
  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                {icon}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-950">
                {title}
              </h2>

              {description && (
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                  {description}
                </p>
              )}
            </div>
          </div>

          {status && (
            <div className="shrink-0">
              {status}
            </div>
          )}
        </div>
      </div>

      <div
        className={[
          "p-6",
          contentClassName,
        ].join(" ")}
      >
        {children}
      </div>

      {footer && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          {footer}
        </div>
      )}
    </section>
  )
}