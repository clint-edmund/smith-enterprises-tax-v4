import { SupabaseStatus } from "@/components/common/supabase-status"

const dashboardCards = [
  {
    label: "Active Clients",
    value: "0",
  },
  {
    label: "Open Returns",
    value: "0",
  },
  {
    label: "Outstanding Balance",
    value: "$0.00",
  },
  {
    label: "Documents Pending",
    value: "0",
  },
]

export function DashboardPage() {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-600">
          Review client, return, payment, and document
          activity.
        </p>
      </header>

      <SupabaseStatus />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <p className="text-sm font-medium text-slate-600">
              {card.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {card.value}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 p-8">
        <h2 className="font-semibold text-slate-950">
          Recent activity
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Client and tax-return activity will appear after
          authentication and staff approval are complete.
        </p>
      </div>
    </section>
  )
}