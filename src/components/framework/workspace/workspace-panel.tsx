import type {
  ReactNode,
} from "react"

interface WorkspacePanelProps {
  sidebar: ReactNode
  children: ReactNode
}

export function WorkspacePanel({
  sidebar,
  children,
}: WorkspacePanelProps) {
  return (
    <section
      className="
        grid
        gap-6
        lg:grid-cols-[280px_1fr]
      "
    >
      <aside
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          h-fit
        "
      >
        {sidebar}
      </aside>

      <main
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          min-h-[550px]
        "
      >
        {children}
      </main>
    </section>
  )
}