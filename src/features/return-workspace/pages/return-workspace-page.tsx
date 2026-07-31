import {
  useState,
} from "react"

import {
  WorkspaceShell,
  WorkspaceTabs,
} from "@/components/framework/workspace"

import type {
  WorkspaceTab,
} from "@/components/framework/workspace"

import {
  ReturnWorkspaceSummary,
} from "../components/return-workspace-summary"

import {
  useParams,
} from "react-router-dom"

import {
  useReturnWorkspace,
} from "../hooks/use-return-workspace"

import {
  WorkspacePanel,
} from "@/components/framework/workspace"

import {
  ReturnNavigation,
} from "../components/return-navigation"

import {
  ReturnOverviewPanel,
} from "../components/return-overview-panel"

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
  const { returnId = "" } = useParams()

  const {
    summary,
    isLoading,
    error,
  } = useReturnWorkspace(returnId)

  const [
    activeTab,
    setActiveTab,
  ] = useState("overview")

  if (isLoading) {
    return (
      <WorkspaceShell>
        <div className="py-10">
          Loading workspace...
        </div>
      </WorkspaceShell>
    )
  }

  if (error) {
    return (
      <WorkspaceShell>
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-6
            text-red-700
          "
        >
          {error}
        </div>
      </WorkspaceShell>
    )
  }

  return (
    <WorkspaceShell>
      {summary && (
        <ReturnWorkspaceSummary
          summary={summary}
        />
      )}

      <WorkspaceTabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      <WorkspacePanel
        sidebar={<ReturnNavigation />}
      >
        <ReturnOverviewPanel />
      </WorkspacePanel>

    </WorkspaceShell>
  )
}