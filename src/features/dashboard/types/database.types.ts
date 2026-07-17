import type {
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types";

export interface DashboardSummary {
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
}

export interface DashboardActivity {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string;
  occurredAt: string;
}

export interface DashboardReturnItem {
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
}

export type DashboardAttentionReason =
  | "overdue"
  | "due_soon"
  | "unassigned"
  | "documents_pending";

export interface DashboardAttentionItem extends DashboardReturnItem {
  reason: DashboardAttentionReason;
}

export interface DashboardData {
  summary: DashboardSummary;
  activities: DashboardActivity[];
  recentReturns: DashboardReturnItem[];
  attentionItems: DashboardAttentionItem[];
}
