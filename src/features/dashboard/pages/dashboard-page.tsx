import {
  CircleDollarSign,
  FileClock,
  Files,
  RefreshCw,
  Users,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useState,
} from "react"

import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton"
import { QuickActions } from "@/features/dashboard/components/quick-actions"
import { RecentActivity } from "@/features/dashboard/components/recent-activity"
import { SummaryCard } from "@/features/dashboard/components/summary-card"
import { getDashboardData } from "@/features/dashboard/services/dashboard-service"
import type {
  DashboardData,
} from "@/features/dashboard/types/dashboard.types"
import {
  formatCurrency,
  formatNumber,
} from "@/features/dashboard/utils/dashboard-formatters"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function DashboardPage() {
  const { profile } = useAuth()

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const loadDashboard =
    useCallback(async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result =
          await getDashboardData()

        setDashboardData(result)
      } catch (error) {
        console.error(
          "Unable to load dashboard:",
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard information.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [])

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadDashboard()
      }, 0)
    
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadDashboard])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!profile) {
    return null
  }

  if (
    errorMessage ||
    !dashboardData
  ) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
          Dashboard Error
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Dashboard information could not be loaded
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage ??
            "An unexpected error occurred."}
        </p>

        <button
          type="button"
          onClick={() => {
            void loadDashboard()
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800"
        >
          <RefreshCw
            className="size-4"
            aria-hidden="true"
          />

          Try Again
        </button>
      </section>
    )
  }

  const { summary, activities } =
    dashboardData

  const staffName =
    profile.firstName ||
    profile.displayName ||
    "Staff Member"

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
            Operational Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome, {staffName}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Review current client, tax-return,
            payment, and document activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void loadDashboard()
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <RefreshCw
            className="size-4"
            aria-hidden="true"
          />

          Refresh
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Active Clients"
          value={formatNumber(
            summary.activeClients,
          )}
          description="Client records currently marked active"
          icon={Users}
        />

        <SummaryCard
          label="Open Returns"
          value={formatNumber(
            summary.openReturns,
          )}
          description={`${formatNumber(
            summary.completedReturns,
          )} returns completed or accepted`}
          icon={FileClock}
        />

        <SummaryCard
          label="Outstanding Balance"
          value={formatCurrency(
            summary.outstandingBalance,
          )}
          description={`${formatCurrency(
            summary.totalPayments,
          )} in non-voided payments recorded`}
          icon={CircleDollarSign}
        />

        <SummaryCard
          label="Documents Pending"
          value={formatNumber(
            summary.documentsPending,
          )}
          description="Returns currently awaiting client documents"
          icon={Files}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <RecentActivity
          activities={activities}
        />

        <QuickActions
          role={profile.role}
        />
      </div>
    </section>
  )
}