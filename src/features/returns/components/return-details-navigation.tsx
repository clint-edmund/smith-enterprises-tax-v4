import {
  Activity,
  ClipboardCheck,
  CreditCard,
  FileText,
  Landmark,
  MessageSquareText,
  UserRound,
} from "lucide-react"

const navigationItems = [
  {
    id: "return-overview",
    label: "Overview",
    icon: UserRound,
  },
  {
    id: "return-workflow",
    label: "Workflow",
    icon: ClipboardCheck,
  },
  {
    id: "return-payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    id: "return-documents",
    label: "Documents",
    icon: FileText,
  },
  {
    id: "return-notes",
    label: "Notes",
    icon: MessageSquareText,
  },
  {
    id: "return-activity",
    label: "Activity",
    icon: Activity,
  },
  {
    id: "return-audit",
    label: "Record History",
    icon: Landmark,
  },
] as const

function scrollToSection(
  sectionId: string,
) {
  const section =
    document.getElementById(sectionId)

  if (!section) {
    return
  }

  section.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

export function ReturnDetailsNavigation() {
  return (
    <nav
      aria-label="Return workspace sections"
      className="space-y-5"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Return Workspace
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Move between the major areas of this
          tax return.
        </p>
      </div>

      <ul className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  scrollToSection(item.id)
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Icon
                  className="size-4 shrink-0 text-slate-400 transition group-hover:text-blue-700"
                  aria-hidden="true"
                />

                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}