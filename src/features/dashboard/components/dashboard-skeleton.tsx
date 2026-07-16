export function DashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-label="Loading dashboard"
    >
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}