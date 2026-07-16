export interface DashboardSummary {
  activeClients: number
  openReturns: number
  completedReturns: number
  totalFees: number
  totalPayments: number
  outstandingBalance: number
  documentsPending: number
}

export interface DashboardActivity {
  id: number
  action: string
  entityType: string
  entityId: string | null
  actorName: string
  occurredAt: string
}

export interface DashboardData {
  summary: DashboardSummary
  activities: DashboardActivity[]
}