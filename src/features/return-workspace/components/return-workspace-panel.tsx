import type {
  ReactNode,
} from "react"

interface ReturnWorkspacePanelProps {
  children: ReactNode
}

export function ReturnWorkspacePanel({
  children,
}: ReturnWorkspacePanelProps) {
  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >
      {children}
    </section>
  )
}