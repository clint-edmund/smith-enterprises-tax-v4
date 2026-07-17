import type {
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types";

export type DashboardSummary = {
  activeClients: number;
  totalReturns: number;
  openReturns: number;
  completedReturns: number;
  inProgressReturns: number;
  awaitingReviewReturns: number;
  documentsPending: number;
  upcomingDeadlines: number;
  overdueReturns: number;
  unassignedReturns: number;
  totalFees: number;
  totalPayments: number;
  outstandingBalance: number;
};

export type DashboardWorkload = {
  assignedToMe: number;
  reviewAssignedToMe: number;
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
};

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
  loadedAt: string;
};
