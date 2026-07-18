import type {
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types";

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
}

export type DashboardStaffWorkload = {
  staff: DashboardStaffWorkloadItem[]
  totalAssignedPreparation: number
  totalAssignedReview: number
  totalOverdue: number
  totalOnHold: number
}

export type DashboardActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorName: string;
  occurredAt: string;
};

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

export type DashboardData = {
  summary: DashboardSummary;
  workload: DashboardWorkload;
  activities: DashboardActivity[];
  recentReturns: DashboardReturnItem[];
  attentionItems: DashboardAttentionItem[];
  analytics: DashboardAnalytics;
  loadedAt: string;
};

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
