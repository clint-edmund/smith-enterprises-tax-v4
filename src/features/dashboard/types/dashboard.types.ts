import type {
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types";

import type {
  DashboardActivity,
} from "@/features/dashboard/types/activity.types"

export type DashboardWorkflowSummary = {
  intake: number
  documentsPending: number
  readyForPreparation: number
  inPreparation: number
  review: number
  signaturePending: number
  readyToFile: number
  filed: number
  completed: number
  onHold: number
}

export type DashboardSummary = {
  activeClients: number
  totalReturns: number
  openReturns: number
  completedReturns: number

  inProgressReturns: number
  awaitingReviewReturns: number
  documentsPending: number

  upcomingDeadlines: number
  overdueReturns: number
  unassignedReturns: number

  totalFees: number
  totalPayments: number
  outstandingBalance: number

  workflow: DashboardWorkflowSummary
}

export type DashboardWorkload = {
  assignedToMe: number;
  reviewAssignedToMe: number;
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
};

export type DashboardStaffWorkloadItem = {
  staffId: string
  displayName: string
  role: string
  assignedPreparation: number
  assignedReview: number
  inPreparation: number
  awaitingReview: number
  overdue: number
  dueNextSevenDays: number
  onHold: number
  capacityPercentage: number

  capacityStatus:
    | "available"
    | "moderate"
    | "heavy"
    | "overloaded"

  recommendedMaximum: number
}

export type DashboardStaffWorkload = {
  staff: DashboardStaffWorkloadItem[]
  totalAssignedPreparation: number
  totalAssignedReview: number
  totalOverdue: number
  totalOnHold: number
}

export type DashboardExecutiveMetrics = {
  projectedRevenue: number

  returnsDueNext7Days: number

  returnsDueNext30Days: number

  completedThisWeek: number

  completedThisMonth: number

  reviewQueue: number
}

export type DashboardReturnItem = {
  id: string;
  clientId: string;
  clientNumber: number;
  clientName: string;
  taxYear: number;
  returnType: ReturnType;
  taxForm: TaxFormType;
  status: ReturnStatus;
  assignedPreparerName: string | null;
  dueDate: string | null;
  netFee: number;
  updatedAt: string;
};

export type DashboardAttentionReason =
  | "overdue"
  | "documents_pending"
  | "unassigned"
  | "awaiting_review"
  | string;

export type DashboardAttentionItem = DashboardReturnItem & {
  reason: DashboardAttentionReason;
};

export type DashboardReadinessMetrics = {
  activeReturns: number
  readinessEligibleReturns: number
  readyForPreparation: number
  needsDocuments: number
  missingPreparer: number
  readyForReview: number
  blockedReturns: number
  overdueReturns: number
  averageReadinessScore: number
  officeHealthScore: number
}

export type DashboardRecommendationPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"

export type DashboardRecommendationType =
  | "collect_documents"
  | "assign_preparer"
  | "begin_preparation"
  | "assign_reviewer"
  | "review_return"
  | "resolve_blocker"
  | "due_date"

export type DashboardRecommendation = {
  id: string
  returnId: string
  clientId: string
  clientName: string
  taxYear: number
  returnType: string
  recommendationType: DashboardRecommendationType
  title: string
  explanation: string
  priority: DashboardRecommendationPriority
  readinessScore: number
  dueDate: string | null
  actionRoute: string
}

export type DashboardRiskLevel =
  | "critical"
  | "high"
  | "medium"
  | "low"

export type DashboardRiskFactorType =
  | "overdue"
  | "due_soon"
  | "missing_documents"
  | "missing_preparer"
  | "missing_reviewer"
  | "blocked"
  | "inactive"
  | "unpaid_balance"
  | "workflow_delay"

export type DashboardRiskFactor = {
  type: DashboardRiskFactorType
  label: string
  description: string
  points: number
}

export type DashboardPriorityItem = {
  id: string
  returnId: string
  clientId: string
  clientName: string
  taxYear: number
  returnType: string
  status: string
  riskScore: number
  riskLevel: DashboardRiskLevel
  readinessScore: number
  dueDate: string | null
  daysUntilDue: number | null
  daysSinceActivity: number | null
  assignedPreparerName: string | null
  assignedReviewerName: string | null
  outstandingBalance: number
  recommendedAction: string
  actionRoute: string
  riskFactors: DashboardRiskFactor[]
}

export type DashboardRiskMetrics = {
  evaluatedReturns: number
  criticalRiskReturns: number
  highRiskReturns: number
  mediumRiskReturns: number
  lowRiskReturns: number
  overdueReturns: number
  dueWithinThreeDays: number
  dueWithinSevenDays: number
  inactiveReturns: number
  averageRiskScore: number
}

export type DashboardData = {
  summary: DashboardSummary
  executive: DashboardExecutiveMetrics
  workload: DashboardWorkload
  readiness: DashboardReadinessMetrics
  recommendations: DashboardRecommendation[]
  risk: DashboardRiskMetrics
  priorityQueue: DashboardPriorityItem[]
  activities: DashboardActivity[]
  recentReturns: DashboardReturnItem[]
  attentionItems: DashboardAttentionItem[]
  analytics: DashboardAnalytics
  loadedAt: string
}

export type DashboardMonthlyFinancial = {
  month: string;
  monthLabel: string;
  fees: number;
  payments: number;
  outstanding: number;
};

export type DashboardStatusMetric = {
  status: ReturnStatus;
  label: string;
  count: number;
};

export type DashboardStaffWorkloadMetric = {
  staffId: string | null;
  staffName: string;
  assignedReturns: number;
  overdueReturns: number;
  awaitingReviewReturns: number;
};

export type DashboardAnalytics = {
  monthlyFinancials: DashboardMonthlyFinancial[];
  statusMetrics: DashboardStatusMetric[];
  staffWorkload: DashboardStaffWorkloadMetric[];
};
