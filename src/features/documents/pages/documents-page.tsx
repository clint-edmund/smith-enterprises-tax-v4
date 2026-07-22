import { FolderLock } from "lucide-react"

export function DocumentsPage() {
  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
            <FolderLock className="size-8" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              Enterprise Document Center
            </h1>

            <p className="mt-2 text-slate-600">
              Secure document management for every client,
              tax return, engagement, and internal workflow.
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold">
          Phase ER-1.1
        </h2>

        <p className="mt-4 text-slate-600">
          The enterprise document center is now connected.
          Next we'll integrate the existing Document Workspace,
          client filtering, and global search.
        </p>
      </div>
    </section>
  )
}