import type {
  PropsWithChildren,
  ReactNode,
} from "react"

interface WorkspaceHeaderProps
  extends PropsWithChildren {

  title: string

  description?: ReactNode

  actions?: ReactNode
}

export function WorkspaceHeader({
  title,
  description,
  actions,
  children,
}: WorkspaceHeaderProps) {
  return (
    <header
      className="
        flex
        flex-col
        gap-6
        rounded-xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div
          className="
            min-w-0
            space-y-2
          "
        >
          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {title}
          </h1>

          {description && (
            <div
              className="
                text-sm
                text-slate-600
              "
            >
              {description}
            </div>
          )}
        </div>

        {actions && (
          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div
          className="
            border-t
            border-slate-200
            pt-6
          "
        >
          {children}
        </div>
      )}
    </header>
  )
}