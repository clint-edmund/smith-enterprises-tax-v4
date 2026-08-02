import type {
  ReactNode,
} from "react"

import {
  OrganizerSidebar,
} from "./organizer-sidebar"

import {
  organizerTheme,
} from "./organizer-theme"

import type {
  OrganizerNavigationItem,
} from "./organizer-workspace.types"

interface OrganizerWorkspaceProps {
  title: string
  description: string

  taxYear: number

  progress: number

  completedSections: number

  totalSections: number

  currentSectionTitle: string

  navigationItems:
    OrganizerNavigationItem[]

  children: ReactNode
}

export function OrganizerWorkspace({
  taxYear,

  progress,

  completedSections,

  totalSections,

  currentSectionTitle,

  navigationItems,

  children,
}: OrganizerWorkspaceProps) {
  return (
    <div
      className="mx-auto grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]"
      style={{
        maxWidth:
          organizerTheme.layout.contentMaxWidth,
      }}
    >
      <OrganizerSidebar
        taxYear={taxYear}
        progress={progress}
        completedSections={completedSections}
        totalSections={totalSections}
        currentSectionTitle={currentSectionTitle}
        items={navigationItems}
      />

      <main className="min-w-0">
        {children}
      </main>
    </div>
  )
}