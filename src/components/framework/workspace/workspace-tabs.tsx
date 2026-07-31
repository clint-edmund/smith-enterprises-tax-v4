import {
  useRef,
} from "react"
import type {
  KeyboardEvent,
  ReactNode,
} from "react"

export interface WorkspaceTab {
  id: string
  label: string
  badge?: ReactNode
  disabled?: boolean
}

interface WorkspaceTabsProps {
  tabs: WorkspaceTab[]
  activeTabId: string
  onTabChange: (
    tabId: string,
  ) => void
  ariaLabel?: string
}

export function WorkspaceTabs({
  tabs,
  activeTabId,
  onTabChange,
  ariaLabel = "Workspace sections",
}: WorkspaceTabsProps) {
  const tabRefs =
    useRef<Array<HTMLButtonElement | null>>([])

  function getEnabledTabIndexes() {
    return tabs
      .map((tab, index) => ({
        tab,
        index,
      }))
      .filter(({ tab }) => !tab.disabled)
      .map(({ index }) => index)
  }

  function activateTab(index: number) {
    const tab = tabs[index]

    if (!tab || tab.disabled) {
      return
    }

    onTabChange(tab.id)
    tabRefs.current[index]?.focus()
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const enabledIndexes =
      getEnabledTabIndexes()

    if (enabledIndexes.length === 0) {
      return
    }

    const enabledPosition =
      enabledIndexes.indexOf(currentIndex)

    if (enabledPosition === -1) {
      return
    }

    let nextIndex: number | undefined

    switch (event.key) {
      case "ArrowRight": {
        const nextPosition =
          (enabledPosition + 1) %
          enabledIndexes.length

        nextIndex =
          enabledIndexes[nextPosition]

        break
      }

      case "ArrowLeft": {
        const previousPosition =
          (
            enabledPosition -
            1 +
            enabledIndexes.length
          ) %
          enabledIndexes.length

        nextIndex =
          enabledIndexes[previousPosition]

        break
      }

      case "Home":
        nextIndex = enabledIndexes[0]
        break

      case "End":
        nextIndex =
          enabledIndexes[
            enabledIndexes.length - 1
          ]
        break

      default:
        return
    }

    event.preventDefault()

    if (nextIndex !== undefined) {
      activateTab(nextIndex)
    }
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex min-w-max border-b border-slate-200 px-2"
      >
        {tabs.map((tab, index) => {
          const isActive =
            tab.id === activeTabId

          const tabId =
            `workspace-tab-${tab.id}`

          const panelId =
            `workspace-panel-${tab.id}`

          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] =
                  element
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-controls={panelId}
              aria-selected={isActive}
              disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              className={[
                "relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "text-blue-700"
                  : "text-slate-600 hover:text-slate-950",
              ].join(" ")}
              onClick={() => {
                onTabChange(tab.id)
              }}
              onKeyDown={(event) => {
                handleKeyDown(
                  event,
                  index,
                )
              }}
            >
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span className="flex items-center">
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}