import {
  Activity,
  ClipboardCheck,
  CreditCard,
  FileText,
  Landmark,
  MessageSquareText,
  UserRound,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"

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

type ReturnSectionId =
  (typeof navigationItems)[number]["id"]

export function ReturnDetailsNavigation() {
  const [
    activeSectionId,
    setActiveSectionId,
  ] = useState<ReturnSectionId>(
    "return-overview",
  )

  useEffect(() => {
    const sections =
      navigationItems
        .map((item) =>
          document.getElementById(
            item.id,
          ),
        )
        .filter(
          (
            section,
          ): section is HTMLElement =>
            section !== null,
        )

    if (sections.length === 0) {
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visibleEntries =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting,
              )
              .sort(
                (first, second) =>
                  second.intersectionRatio -
                  first.intersectionRatio,
              )

          const activeEntry =
            visibleEntries[0]

          if (!activeEntry) {
            return
          }

          setActiveSectionId(
            activeEntry.target
              .id as ReturnSectionId,
          )
        },
        {
          root: null,
          rootMargin:
            "-20% 0px -65% 0px",
          threshold: [
            0,
            0.1,
            0.25,
            0.5,
            0.75,
            1,
          ],
        },
      )

    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  function handleNavigate(
    sectionId: ReturnSectionId,
  ) {
    const section =
      document.getElementById(
        sectionId,
      )

    if (!section) {
      return
    }

    setActiveSectionId(sectionId)

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

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
          Move between the major areas
          of this tax return.
        </p>
      </div>

      <ul className="space-y-1">
        {navigationItems.map(
          (item) => {
            const Icon = item.icon

            const isActive =
              item.id ===
              activeSectionId

            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={
                    isActive
                      ? "location"
                      : undefined
                  }
                  onClick={() => {
                    handleNavigate(
                      item.id,
                    )
                  }}
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                    isActive
                      ? "bg-blue-100 text-blue-900 shadow-sm"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-800",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    className={[
                      "size-4 shrink-0 transition",
                      isActive
                        ? "text-blue-700"
                        : "text-slate-400 group-hover:text-blue-700",
                    ].join(" ")}
                  />

                  <span className="min-w-0 flex-1">
                    {item.label}
                  </span>

                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-blue-700"
                    />
                  )}
                </button>
              </li>
            )
          },
        )}
      </ul>
    </nav>
  )
}