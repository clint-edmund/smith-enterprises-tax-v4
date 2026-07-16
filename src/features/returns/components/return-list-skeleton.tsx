export function ReturnListSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-label="Loading tax returns"
    >
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-xl bg-slate-200"
        />
      ))}
    </div>
  )
}