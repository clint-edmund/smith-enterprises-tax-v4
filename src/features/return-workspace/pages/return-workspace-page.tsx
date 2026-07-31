import {
  useState,
} from "react"

import {
  WorkspaceHeader,
  WorkspaceShell,
  WorkspaceTabs,
} from "@/components/framework/workspace"

import type {
  WorkspaceTab,
} from "@/components/framework/workspace"

import {
  ReturnWorkspacePanel,
} from "../components/return-workspace-panel"

const tabs: WorkspaceTab[] = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "workflow",
    label: "Workflow",
  },
  {
    id: "documents",
    label: "Documents",
  },
  {
    id: "payments",
    label: "Payments",
  },
  {
    id: "communications",
    label: "Communications",
  },
  {
    id: "activity",
    label: "Activity",
  },
  {
    id: "audit",
    label: "Audit",
  },
]

export function ReturnWorkspacePage() {
  const [
    activeTab,
    setActiveTab,
  ] = useState("overview")

  return (
    <WorkspaceShell>
      <WorkspaceHeader
        title="Return Workspace"
        description={
          <>
            This workspace will become the
            central location for managing
            an individual tax return.
          </>
        }
      />

      <WorkspaceTabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      <ReturnWorkspacePanel>
        <div
          role="tabpanel"
          id={`workspace-panel-${activeTab}`}
          aria-labelledby={`workspace-tab-${activeTab}`}
          className="
            min-h-[300px]
          "
        >
          <h2
            className="
              text-xl
              font-semibold
              text-slate-900
            "
          >
            {tabs.find(
              (tab) =>
                tab.id === activeTab,
            )?.label}
          </h2>

          <p
            className="
              mt-3
              text-slate-600
            "
          >
            This section is currently
            scaffolded.

            Business functionality
            will be added during
            upcoming RC1 milestones.
          </p>
        </div>
      </ReturnWorkspacePanel>
    </WorkspaceShell>
  )
}