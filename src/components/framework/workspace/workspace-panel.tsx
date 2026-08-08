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
    <section className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
        {sidebar}
      </aside>

      <main className="min-h-[550px] min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {children}
      </main>
    </section>
  )
}