import {
  incomeTypeMetadata,
} from "@/features/client-portal/constants/income.constants"

import {
  OrganizerCrudHeader,
  OrganizerEmptyState,
  OrganizerSummaryDashboard,
  OrganizerToolbar,
} from "@/features/client-portal/components/organizer/shared"

import {
  useOrganizerListState,
} from "@/features/client-portal/hooks/use-organizer-list-state"

import type {
  OrganizerIncomeSource,
} from "@/features/client-portal/types/organizer-income.types"

import {
  IncomeSourceCard,
} from "./income-source-card"

import {
  calculateIncomeHealth,
} from "@/features/client-portal/services/organizer-health"

import {
  OrganizerHealthBanner,
} from "@/features/client-portal/components/organizer/shared"

interface IncomeSourceListProps {
  incomeSources: OrganizerIncomeSource[]
  onAdd: () => void
  onEdit: (incomeSource: OrganizerIncomeSource) => void
  onDelete: (incomeSource: OrganizerIncomeSource) => void
}

const incomeFilters = [
  {
    key: "all",
    matches: (_incomeSource: OrganizerIncomeSource) => true,
  },
  {
    key: "draft",
    matches: (incomeSource: OrganizerIncomeSource) =>
      incomeSource.recordStatus === "draft",
  },
  {
    key: "complete",
    matches: (incomeSource: OrganizerIncomeSource) =>
      incomeSource.recordStatus === "complete",
  },
  {
    key: "needs_review",
    matches: (incomeSource: OrganizerIncomeSource) =>
      incomeSource.recordStatus === "needs_review",
  },
  {
    key: "missing_documents",
    matches: (incomeSource: OrganizerIncomeSource) =>
      !incomeSource.documentReceived,
  },
  {
    key: "w2",
    matches: (incomeSource: OrganizerIncomeSource) =>
      incomeSource.incomeType === "w2",
  },
  {
    key: "1099",
    matches: (incomeSource: OrganizerIncomeSource) =>
      incomeSource.incomeType.startsWith("1099_"),
  },
] as const

const incomeSorts = [
  {
    key: "updated_desc",
    compare: (
      firstIncomeSource: OrganizerIncomeSource,
      secondIncomeSource: OrganizerIncomeSource,
    ) =>
      new Date(secondIncomeSource.updatedAt).getTime() -
      new Date(firstIncomeSource.updatedAt).getTime(),
  },
  {
    key: "payer_asc",
    compare: (
      firstIncomeSource: OrganizerIncomeSource,
      secondIncomeSource: OrganizerIncomeSource,
    ) =>
      firstIncomeSource.payerName.localeCompare(
        secondIncomeSource.payerName,
      ),
  },
  {
    key: "payer_desc",
    compare: (
      firstIncomeSource: OrganizerIncomeSource,
      secondIncomeSource: OrganizerIncomeSource,
    ) =>
      secondIncomeSource.payerName.localeCompare(
        firstIncomeSource.payerName,
      ),
  },
  {
    key: "income_type",
    compare: (
      firstIncomeSource: OrganizerIncomeSource,
      secondIncomeSource: OrganizerIncomeSource,
    ) =>
      firstIncomeSource.incomeType.localeCompare(
        secondIncomeSource.incomeType,
      ),
  },
  {
    key: "status",
    compare: (
      firstIncomeSource: OrganizerIncomeSource,
      secondIncomeSource: OrganizerIncomeSource,
    ) =>
      firstIncomeSource.recordStatus.localeCompare(
        secondIncomeSource.recordStatus,
      ),
  },
] as const

const incomeSortOptions = [
  {
    key: "updated_desc",
    label: "Recently Updated",
  },
  {
    key: "payer_asc",
    label: "Payer Name A–Z",
  },
  {
    key: "payer_desc",
    label: "Payer Name Z–A",
  },
  {
    key: "income_type",
    label: "Income Type",
  },
  {
    key: "status",
    label: "Status",
  },
] as const

const recipientLabels = {
  taxpayer: "Taxpayer",
  spouse: "Spouse",
  dependent: "Dependent",
  joint: "Joint",
} as const

const statusLabels = {
  draft: "Draft",
  complete: "Complete",
  needs_review: "Needs Review",
} as const

function getIncomeSearchText(
  incomeSource: OrganizerIncomeSource,
): string {
  const metadata =
    incomeTypeMetadata.find(
      (item) =>
        item.type === incomeSource.incomeType,
    )

  return [
    incomeSource.payerName,
    incomeSource.incomeType,
    metadata?.title ?? "",
    metadata?.shortTitle ?? "",
    metadata?.description ?? "",
    recipientLabels[incomeSource.recipientType],
    statusLabels[incomeSource.recordStatus],
    incomeSource.documentReceived
      ? "document received"
      : "document missing",
    incomeSource.notes,
  ].join(" ")
}

export function IncomeSourceList({
  incomeSources,
  onAdd,
  onEdit,
  onDelete,
}: IncomeSourceListProps) {
  const {
    searchValue,
    filterKey,
    sortKey,
    visibleItems,
    resultCount,
    totalCount,
    setSearchValue,
    setFilterKey,
    setSortKey,
    clearSearch,
    getFilterCount,
  } = useOrganizerListState({
    items: incomeSources,
    searchText: getIncomeSearchText,
    filters: incomeFilters,
    sorts: incomeSorts,
    defaultFilterKey: "all",
    defaultSortKey: "updated_desc",
  })

  if (incomeSources.length === 0) {
    return (
      <OrganizerEmptyState
        title="No Income Sources Added"
        description="Add each W-2, 1099, retirement statement, or other source of income that applies to this tax organizer."
        actionLabel="Add Income Source"
        onAction={onAdd}
      />
    )
  }

  const receivedDocumentCount =
    incomeSources.filter(
      (incomeSource) =>
        incomeSource.documentReceived,
    ).length

  const completeRecordCount =
    incomeSources.filter(
      (incomeSource) =>
        incomeSource.recordStatus === "complete",
    ).length

  const needsAttentionCount =
    incomeSources.length - completeRecordCount

  const completionPercentage =
    (completeRecordCount / incomeSources.length) * 100

  const incomeHealth =
    calculateIncomeHealth({
      incomeSources,
    })

  const filterChips = [
    {
      key: "all",
      label: "All",
      count: getFilterCount("all"),
    },
    {
      key: "draft",
      label: "Draft",
      count: getFilterCount("draft"),
    },
    {
      key: "complete",
      label: "Complete",
      count: getFilterCount("complete"),
    },
    {
      key: "needs_review",
      label: "Needs Review",
      count: getFilterCount("needs_review"),
    },
    {
      key: "missing_documents",
      label: "Missing Documents",
      count: getFilterCount("missing_documents"),
    },
    {
      key: "w2",
      label: "W-2",
      count: getFilterCount("w2"),
    },
    {
      key: "1099",
      label: "1099",
      count: getFilterCount("1099"),
    },
  ]

  return (
    <section className="space-y-6">
      <OrganizerCrudHeader
        title="Income Sources"
        description="Review, search, filter, and manage the income records currently included in this tax organizer."
        addLabel="Add Income Source"
        onAdd={onAdd}
      />

      <OrganizerHealthBanner
        health={
          incomeHealth
        }
      />

      <OrganizerSummaryDashboard
        title="Income Summary"
        description="Monitor the completion status of this organizer's income information."
        progressPercentage={completionPercentage}
        metrics={[
          {
            key: "sources",
            label: "Income Sources",
            value: incomeSources.length,
            description: "Total income records",
          },
          {
            key: "complete",
            label: "Completed",
            value: completeRecordCount,
            description: "Ready for review",
          },
          {
            key: "documents",
            label: "Documents",
            value: `${receivedDocumentCount}/${incomeSources.length}`,
            description: "Supporting documents received",
          },
          {
            key: "attention",
            label: "Needs Attention",
            value: needsAttentionCount,
            description: "Records still in progress",
          },
        ]}
      />

      <OrganizerToolbar
        searchValue={searchValue}
        searchPlaceholder="Search by payer, income type, recipient, status, or notes..."
        onSearchChange={setSearchValue}
        onSearchClear={clearSearch}
        resultCount={resultCount}
        totalCount={totalCount}
        filterKey={filterKey}
        filters={filterChips}
        onFilterChange={setFilterKey}
        sortKey={sortKey}
        sortOptions={incomeSortOptions}
        onSortChange={setSortKey}
      />

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Matching Income Sources
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            No income sources match the current search and filter settings.
            Clear the search or select a different filter to see more records.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Clear Search
              </button>
            )}

            {filterKey !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setFilterKey("all")
                }}
                className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Show All Records
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {visibleItems.map(
            (incomeSource) => (
              <IncomeSourceCard
                key={incomeSource.incomeSourceId}
                incomeSource={incomeSource}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ),
          )}
        </div>
      )}
    </section>
  )
}
