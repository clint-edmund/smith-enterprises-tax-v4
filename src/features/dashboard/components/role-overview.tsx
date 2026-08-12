import {
  CalendarClock,
  ClipboardCheck,
  FileClock,
  Files,
  FolderClock,
  UserRoundCheck,
  UserRoundPlus,
  WalletCards,
} from "lucide-react"

import {
  AtlasKpiCard,
  AtlasSection,
} from "@/components/atlas-ui"
import type {
  DashboardExperience,
} from "@/features/dashboard/config/dashboard-experience"
import type {
  DashboardData,
} from "@/features/dashboard/types/dashboard.types"

interface RoleOverviewProps {
  experience: Exclude<
    DashboardExperience,
    "executive"
  >
  dashboardData: DashboardData
}

export function RoleOverview({
  experience,
  dashboardData,
}: RoleOverviewProps) {
  const {
    summary,
    workload,
  } = dashboardData

  if (experience === "preparation") {
    return (
      <AtlasSection
        title="My Preparation Snapshot"
        description="A quick view of your current preparation workload and items requiring attention."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AtlasKpiCard
            label="Assigned Returns"
            value={workload.assignedToMe}
            icon={Files}
            to="/returns?assignment=mine"
          />

          <AtlasKpiCard
            label="Due This Week"
            value={workload.dueThisWeek}
            icon={CalendarClock}
            to="/returns?assignment=mine&deadline=due_this_week"
          />

          <AtlasKpiCard
            label="Documents Pending"
            value={summary.documentsPending}
            icon={FolderClock}
            to="/returns?workflow=documents_pending"
          />

          <AtlasKpiCard
            label="Ready to Prepare"
            value={
              summary.workflow
                .readyForPreparation
            }
            icon={FileClock}
            to="/returns?workflow=ready_for_preparation"
          />
        </div>
      </AtlasSection>
    )
  }

  if (experience === "review") {
    return (
      <AtlasSection
        title="My Review Snapshot"
        description="A quick view of your review assignments, deadlines, and approval workload."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AtlasKpiCard
            label="Assigned Reviews"
            value={
              workload.reviewAssignedToMe
            }
            icon={UserRoundCheck}
            to="/returns?reviewer=mine"
          />

          <AtlasKpiCard
            label="Due This Week"
            value={workload.dueThisWeek}
            icon={CalendarClock}
            to="/returns?reviewer=mine&deadline=due_this_week"
          />

          <AtlasKpiCard
            label="Awaiting Review"
            value={
              summary.awaitingReviewReturns
            }
            icon={ClipboardCheck}
            to="/returns?workflow=review"
          />

          <AtlasKpiCard
            label="Ready to File"
            value={
              summary.workflow
                .readyToFile
            }
            icon={FileClock}
            to="/returns?workflow=ready_to_file"
          />
        </div>
      </AtlasSection>
    )
  }

  if (experience === "front-desk") {
    return (
      <AtlasSection
        title="Front Desk Snapshot"
        description="A quick view of client activity, documents, assignments, and balances requiring attention."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AtlasKpiCard
            label="Active Clients"
            value={summary.activeClients}
            icon={UserRoundPlus}
            to="/clients"
          />

          <AtlasKpiCard
            label="Documents Pending"
            value={summary.documentsPending}
            icon={FolderClock}
            to="/returns?workflow=documents_pending"
          />

          <AtlasKpiCard
            label="Unassigned Returns"
            value={summary.unassignedReturns}
            icon={Files}
            to="/returns?assignment=unassigned"
          />

          <AtlasKpiCard
            label="Outstanding Balance"
            value={new Intl.NumberFormat(
                "en-US",
                {
                style: "currency",
                currency: "USD",
                },
            ).format(
                summary.outstandingBalance,
            )}
            icon={WalletCards}
            to="/payments"
          />
        </div>
      </AtlasSection>
    )
  }

  return (
    <AtlasSection
      title="Office Snapshot"
      description="A high-level view of current return activity available to your account."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AtlasKpiCard
          label="Open Returns"
          value={summary.openReturns}
          icon={Files}
        />

        <AtlasKpiCard
          label="In Progress"
          value={summary.inProgressReturns}
          icon={FileClock}
        />

        <AtlasKpiCard
          label="Awaiting Review"
          value={
            summary.awaitingReviewReturns
          }
          icon={ClipboardCheck}
        />

        <AtlasKpiCard
          label="Completed"
          value={summary.completedReturns}
          icon={UserRoundCheck}
        />
      </div>
    </AtlasSection>
  )
}