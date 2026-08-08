import { Search, Star, X } from "lucide-react"

interface DocumentSearchBarProps {
  searchValue: string
  showFavoritesOnly: boolean
  resultCount: number
  onSearchChange: (value: string) => void
  onFavoritesChange: (value: boolean) => void
}

export function DocumentSearchBar({
  searchValue,
  showFavoritesOnly,
  resultCount,
  onSearchChange,
  onFavoritesChange,
}: DocumentSearchBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search file name, category, description, or uploader"
          type="search"
          value={searchValue}
        />
        {searchValue ? (
          <button
            aria-label="Clear document search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => onSearchChange("")}
            type="button"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600">
          {resultCount} {resultCount === 1 ? "document" : "documents"}
        </span>
        <button
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            showFavoritesOnly
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
          onClick={() => onFavoritesChange(!showFavoritesOnly)}
          type="button"
        >
          <Star className={`size-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          Favorites
        </button>
      </div>
    </div>
  )
}
