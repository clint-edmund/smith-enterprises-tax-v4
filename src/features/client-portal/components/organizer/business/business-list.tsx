import type {
  OrganizerBusiness,
} from "@/features/client-portal/types/organizer-business.types"

interface BusinessListProps {
  businesses: OrganizerBusiness[]
  isDeleting?: boolean
  onAdd(): void
  onEdit(
    business: OrganizerBusiness,
  ): void
  onDelete(
    business: OrganizerBusiness,
  ): void
}

export function BusinessList({
  businesses,
  isDeleting = false,
  onAdd,
  onEdit,
  onDelete,
}: BusinessListProps) {
  if (businesses.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          No businesses have been added
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Add each business or self-employment activity that was active during the tax year.
        </p>

        <button
          type="button"
          onClick={onAdd}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Business
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Businesses
        </h2>

        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Business
        </button>
      </div>

      {businesses.map((business) => (
        <article
          key={business.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {business.businessName || business.dbaName}
              </h3>

              <p className="text-sm text-slate-600">
                {business.principalBusinessActivity}
              </p>

              <div className="mt-3 grid gap-1 text-sm text-slate-700">
                <div><strong>Entity:</strong> {business.entityType || "Not specified"}</div>
                <div><strong>EIN:</strong> {business.employerIdentificationNumber || "N/A"}</div>
                <div><strong>Gross Receipts:</strong> ${business.grossReceipts.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(business)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Edit
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onDelete(business)}
                className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
