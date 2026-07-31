const items = [
  "Overview",
  "Documents",
  "Payments",
  "Notes",
  "Workflow",
  "E-File",
  "History",
]

export function ReturnNavigation() {
  return (
    <nav>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              className="
                w-full
                rounded-lg
                px-3
                py-2
                text-left
                text-sm
                font-medium
                text-slate-700
                hover:bg-slate-100
                hover:text-slate-900
                transition-colors
              "
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}