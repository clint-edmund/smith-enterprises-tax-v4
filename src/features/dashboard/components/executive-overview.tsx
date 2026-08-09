import {
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  HeartPulse,
} from "lucide-react"

import {
  AtlasKpiCard,
  AtlasMetric,
  AtlasSection,
  AtlasStatusPill,
} from "@/components/atlas-ui"

import type {
  DashboardExecutiveMetrics,
  DashboardReadinessMetrics,
  DashboardSummary,
} from "@/features/dashboard/types/dashboard.types"

import {
  formatCurrency,
  formatNumber,
} from "@/features/dashboard/utils/dashboard-formatters"

interface ExecutiveOverviewProps {
  summary: DashboardSummary
  executive: DashboardExecutiveMetrics
  readiness: DashboardReadinessMetrics
  loadedAt: string
}

function getHealthTone(
  score: number,
):
  | "success"
  | "warning"
  | "danger" {
  if (score >= 85) {
    return "success"
  }

  if (score >= 70) {
    return "warning"
  }

  return "danger"
}

function getHealthLabel(
  score: number,
): string {
  if (score >= 90) {
    return "Excellent"
  }

  if (score >= 85) {
    return "Healthy"
  }

  if (score >= 70) {
    return "Needs Attention"
  }

  return "At Risk"
}

export function ExecutiveOverview({
  summary,
  executive,
  readiness,
  loadedAt,
}: ExecutiveOverviewProps) {
  const healthTone =
    getHealthTone(
      readiness.officeHealthScore,
    )

  const healthLabel =
    getHealthLabel(
      readiness.officeHealthScore,
    )

  const criticalAttention =
    readiness.overdueReturns +
    readiness.blockedReturns +
    readiness.needsDocuments +
    readiness.missingPreparer

  return (
    <AtlasSection
      title="Office Overview"
      description="A real-time snapshot of office health, production, risk, and financial performance."
      actions={
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Last refreshed
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {new Date(
              loadedAt,
            ).toLocaleTimeString(
              [],
              {
                hour: "numeric",
                minute: "2-digit",
              },
            )}
          </p>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AtlasKpiCard
          label="Office Health"
          value={
            <div className="flex items-baseline gap-1">
                <span className="text-4xl">
                {formatNumber(
                    readiness.officeHealthScore,
                )}
                </span>

                <span className="text-lg font-semibold text-slate-400">
                / 100
                </span>
            </div>
            }
          icon={HeartPulse}
          tone={healthTone}
          description={
            <div className="space-y-3">
              <AtlasStatusPill
                tone={healthTone}
              >
                {healthLabel}
              </AtlasStatusPill>

              <p>
                Average readiness{" "}
                {formatNumber(
                  readiness.averageReadinessScore,
                )}
                %
              </p>
            </div>
          }
          footer={
            <AtlasMetric
              label="Active returns"
              value={formatNumber(
                readiness.activeReturns,
              )}
            />
          }
        />

        <AtlasKpiCard
        label="Critical Attention"
        value={
            <div>
            <span>
                {formatNumber(
                criticalAttention,
                )}
            </span>

            <span className="ml-2 text-base font-semibold text-slate-500">
                signals
            </span>
            </div>
        }
          icon={AlertTriangle}
          tone={
            criticalAttention > 0
              ? "danger"
              : "success"
          }
          description={
            <div className="space-y-3">
            <p className="text-xs leading-5 text-slate-500">
            Operational flags may overlap across the same return.
            </p>
              <AtlasMetric
                label="Overdue"
                value={formatNumber(
                  readiness.overdueReturns,
                )}
              />

              <AtlasMetric
                label="Blocked"
                value={formatNumber(
                  readiness.blockedReturns,
                )}
              />

              <AtlasMetric
                label="Missing documents"
                value={formatNumber(
                  readiness.needsDocuments,
                )}
              />

              <AtlasMetric
                label="Missing preparer"
                value={formatNumber(
                  readiness.missingPreparer,
                )}
              />
            </div>
          }
        />

        <AtlasKpiCard
          label="Production"
          value={
            <div>
                <span>
                {formatNumber(
                    executive.completedThisWeek,
                )}
                </span>

                <span className="ml-2 text-base font-semibold text-slate-500">
                this week
                </span>
            </div>
            }
          icon={BarChart3}
          tone="info"
          description={
            <div className="space-y-3">
              <AtlasMetric
                label="Completed this week"
                value={formatNumber(
                  executive.completedThisWeek,
                )}
              />

              <AtlasMetric
                label="Completed this month"
                value={formatNumber(
                  executive.completedThisMonth,
                )}
              />

              <AtlasMetric
                label="Ready for preparation"
                value={formatNumber(
                  readiness.readyForPreparation,
                )}
              />

              <AtlasMetric
                label="Ready for review"
                value={formatNumber(
                  readiness.readyForReview,
                )}
              />
            </div>
          }
        />

        <AtlasKpiCard
          label="Financial Snapshot"
          value={formatCurrency(
            summary.totalPayments,
          )}
          icon={CircleDollarSign}
          tone="success"
          description={
            <div className="space-y-3">
              <AtlasMetric
                label="Preparation fees"
                value={formatCurrency(
                  summary.totalFees,
                )}
              />

              <AtlasMetric
                label="Payments"
                value={formatCurrency(
                  summary.totalPayments,
                )}
              />

              <AtlasMetric
                label="Outstanding"
                value={
                    <span
                    className={
                        summary.outstandingBalance > 0
                        ? "text-red-700"
                        : "text-emerald-700"
                    }
                    >
                    {formatCurrency(
                        summary.outstandingBalance,
                    )}
                    </span>
                }
                />

              <AtlasMetric
                label="Projected revenue"
                value={formatCurrency(
                  executive.projectedRevenue,
                )}
              />
            </div>
          }
        />
      </div>
    </AtlasSection>
  )
}