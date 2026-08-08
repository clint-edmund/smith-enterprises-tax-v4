interface ReviewLoadingSkeletonProps {
  cardCount?: number
}

export function ReviewLoadingSkeleton({
  cardCount = 3,
}: ReviewLoadingSkeletonProps) {
  return (
    <div
      className="space-y-6"
      aria-label="Loading review information"
      aria-busy="true"
    >
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="mt-4 h-9 w-72 max-w-full rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-slate-100" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length:
            cardCount,
        }).map(
          (
            _,
            index,
          ) => (
            <div
              key={
                index
              }
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="mt-5 h-8 w-20 rounded bg-slate-200" />
              <div className="mt-5 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
            </div>
          ),
        )}
      </div>
    </div>
  )
}
