interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Smith Enterprises
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600">
          {description}
        </p>
      </header>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
        <p className="text-sm text-slate-500">
          This module will be completed during its assigned
          development phase.
        </p>
      </div>
    </section>
  )
}