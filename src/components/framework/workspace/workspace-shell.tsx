import type { PropsWithChildren } from "react"

type WorkspaceShellProps = PropsWithChildren

export function WorkspaceShell({
  children,
}: WorkspaceShellProps) {
  return (
    <section
      className="
        flex
        flex-col
        gap-6
      "
    >
      {children}
    </section>
  )
}