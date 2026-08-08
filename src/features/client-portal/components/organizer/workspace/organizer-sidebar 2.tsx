import {
  OrganizerNavigationItem,
} from "./organizer-navigation-item"

import {
  OrganizerProgressCard,
} from "./organizer-progress-card"

import type {
  OrganizerNavigationItem as OrganizerNavigationItemModel,
} from "./organizer-workspace.types"

interface OrganizerSidebarProps {
  taxYear: number

  progress: number

  completedSections: number

  totalSections: number

  currentSectionTitle: string

  items: OrganizerNavigationItemModel[]
}

export function OrganizerSidebar({
  taxYear,
  progress,
  completedSections,
  totalSections,
  currentSectionTitle,
  items,
}: OrganizerSidebarProps) {
  return (
    <aside className="space-y-6">

      <OrganizerProgressCard
        taxYear={taxYear}
        progress={progress}
        completedSections={completedSections}
        totalSections={totalSections}
        currentSectionTitle={currentSectionTitle}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Organizer Sections
        </h3>

        <div className="space-y-2">

          {items.map((item) => (
            <OrganizerNavigationItem
              key={item.key}
              item={item}
            />
          ))}

        </div>

      </div>

    </aside>
  )
}