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
  ReturnWorkspacePanel,
} from "../components/return-workspace-panel"

import {
  ReturnWorkspaceSummary,
} from "../components/return-workspace-summary"

import {
  useParams,
} from "react-router-dom"

import {
  useReturnWorkspace,
} from "../hooks/use-return-workspace"

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

      <ReturnWorkspacePanel>
  <div
    role="tabpanel"
    id={`workspace-panel-${activeTab}`}
    aria-labelledby={`workspace-tab-${activeTab}`}
    className="min-h-[300px]"
  >
    <h2
      className="
        text-2xl
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
        mt-4
        max-w-3xl
        text-slate-600
      "
    >
      This section is ready for
      business functionality.

      Future milestones will connect
      this panel to Supabase services,
      workflow actions, document
      management, payments, and audit
      history.
    </p>
  </div>
</ReturnWorkspacePanel>
    </WorkspaceShell>
  )
}