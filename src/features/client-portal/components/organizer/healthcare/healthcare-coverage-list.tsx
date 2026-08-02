import {
  healthcareCoverageMetadata,
} from "@/features/client-portal/constants/healthcare.constants"

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
  OrganizerHealthcareCoverage,
} from "@/features/client-portal/types/organizer-healthcare.types"

import {
  HealthcareCoverageCard,
} from "./healthcare-coverage-card"

interface HealthcareCoverageListProps {
  coverages:
    OrganizerHealthcareCoverage[]

  onAdd: () => void

  onEdit: (
    coverage:
      OrganizerHealthcareCoverage,
  ) => void

  onDelete: (
    coverage:
      OrganizerHealthcareCoverage,
  ) => void
}

const healthcareFilters = [
  {
    key: "all",
    matches: (
      _coverage:
        OrganizerHealthcareCoverage,
    ) => true,
  },
  {
    key: "complete",
    matches: (
      coverage:
        OrganizerHealthcareCoverage,
    ) =>
      coverage.recordStatus ===
      "complete",
  },
  {
    key: "draft",
    matches: (
      coverage:
        OrganizerHealthcareCoverage,
    ) =>
      coverage.recordStatus ===
      "draft",
  },
  {
    key: "needs_review",
    matches: (
      coverage:
        OrganizerHealthcareCoverage,
    ) =>
      coverage.recordStatus ===
      "needs_review",
  },
  {
    key: "missing_documents",
    matches: (
      coverage:
        OrganizerHealthcareCoverage,
    ) =>
      !coverage.documentReceived,
  },
  {
    key: "marketplace",
    matches: (
      coverage:
        OrganizerHealthcareCoverage,
    ) =>
      coverage.coverageType ===
      "marketplace",
  },
  {
    key: "employer",
    matches: (
      coverage:
        OrganizerHealthcareCoverage,
    ) =>
      coverage.coverageType ===
      "employer",
  },
  {
    key: "government",
    matches: (
      coverage:
        OrganizerHealthcareCoverage,
    ) =>
      coverage.coverageType ===
        "medicare" ||
      coverage.coverageType ===
        "medicaid" ||
      coverage.coverageType ===
        "military",
  },
] as const

const healthcareSorts = [
  {
    key: "updated_desc",
    compare: (
      firstCoverage:
        OrganizerHealthcareCoverage,
      secondCoverage:
        OrganizerHealthcareCoverage,
    ) =>
      new Date(
        secondCoverage.updatedAt,
      ).getTime() -
      new Date(
        firstCoverage.updatedAt,
      ).getTime(),
  },
  {
    key: "provider_asc",
    compare: (
      firstCoverage:
        OrganizerHealthcareCoverage,
      secondCoverage:
        OrganizerHealthcareCoverage,
    ) =>
      firstCoverage.providerName.localeCompare(
        secondCoverage.providerName,
      ),
  },
  {
    key: "provider_desc",
    compare: (
      firstCoverage:
        OrganizerHealthcareCoverage,
      secondCoverage:
        OrganizerHealthcareCoverage,
    ) =>
      secondCoverage.providerName.localeCompare(
        firstCoverage.providerName,
      ),
  },
  {
    key: "covered_person",
    compare: (
      firstCoverage:
        OrganizerHealthcareCoverage,
      secondCoverage:
        OrganizerHealthcareCoverage,
    ) =>
      firstCoverage.coveredPersonName.localeCompare(
        secondCoverage.coveredPersonName,
      ),
  },
  {
    key: "coverage_type",
    compare: (
      firstCoverage:
        OrganizerHealthcareCoverage,
      secondCoverage:
        OrganizerHealthcareCoverage,
    ) =>
      firstCoverage.coverageType.localeCompare(
        secondCoverage.coverageType,
      ),
  },
  {
    key: "status",
    compare: (
      firstCoverage:
        OrganizerHealthcareCoverage,
      secondCoverage:
        OrganizerHealthcareCoverage,
    ) =>
      firstCoverage.recordStatus.localeCompare(
        secondCoverage.recordStatus,
      ),
  },
] as const

const healthcareSortOptions = [
  {
    key: "updated_desc",
    label: "Recently Updated",
  },
  {
    key: "provider_asc",
    label: "Provider A–Z",
  },
  {
    key: "provider_desc",
    label: "Provider Z–A",
  },
  {
    key: "covered_person",
    label: "Covered Person",
  },
  {
    key: "coverage_type",
    label: "Coverage Type",
  },
  {
    key: "status",
    label: "Status",
  },
] as const

const statusLabels = {
  draft:
    "Draft",

  complete:
    "Complete",

  needs_review:
    "Needs Review",
} as const

function getHealthcareSearchText(
  coverage:
    OrganizerHealthcareCoverage,
): string {
  const metadata =
    healthcareCoverageMetadata[
      coverage.coverageType
    ]

  return [
    coverage.providerName,
    coverage.coverageType,
    metadata.title,
    metadata.shortTitle,
    coverage.coveredPersonName,
    coverage.policyNumber ?? "",
    coverage.documentType ?? "",
    coverage.documentReceived
      ? "document received"
      : "document missing",
    statusLabels[
      coverage.recordStatus
    ],
    coverage.notes,
  ].join(" ")
}

export function HealthcareCoverageList({
  coverages,
  onAdd,
  onEdit,
  onDelete,
}: HealthcareCoverageListProps) {
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
  } =
    useOrganizerListState({
      items:
        coverages,

      searchText:
        getHealthcareSearchText,

      filters:
        healthcareFilters,

      sorts:
        healthcareSorts,

      defaultFilterKey:
        "all",

      defaultSortKey:
        "updated_desc",
    })

  if (
    coverages.length === 0
  ) {
    return (
      <OrganizerEmptyState
        title="No Healthcare Coverage Added"
        description="Add each health insurance policy or coverage source that applied during the tax year."
        actionLabel="Add Coverage"
        onAction={
          onAdd
        }
      />
    )
  }

  const completeCount =
    coverages.filter(
      (coverage) =>
        coverage.recordStatus ===
        "complete",
    ).length

  const receivedDocumentCount =
    coverages.filter(
      (coverage) =>
        coverage.documentReceived,
    ).length

  const marketplaceCount =
    coverages.filter(
      (coverage) =>
        coverage.coverageType ===
        "marketplace",
    ).length

  const completionPercentage =
    (
      completeCount /
      coverages.length
    ) * 100

  const filterChips = [
    {
      key: "all",
      label: "All",
      count:
        getFilterCount(
          "all",
        ),
    },
    {
      key: "complete",
      label: "Complete",
      count:
        getFilterCount(
          "complete",
        ),
    },
    {
      key: "draft",
      label: "Draft",
      count:
        getFilterCount(
          "draft",
        ),
    },
    {
      key: "needs_review",
      label: "Needs Review",
      count:
        getFilterCount(
          "needs_review",
        ),
    },
    {
      key: "missing_documents",
      label:
        "Missing Documents",
      count:
        getFilterCount(
          "missing_documents",
        ),
    },
    {
      key: "marketplace",
      label: "Marketplace",
      count:
        getFilterCount(
          "marketplace",
        ),
    },
    {
      key: "employer",
      label: "Employer",
      count:
        getFilterCount(
          "employer",
        ),
    },
    {
      key: "government",
      label:
        "Government",
      count:
        getFilterCount(
          "government",
        ),
    },
  ]

  return (
    <section className="space-y-6">
      <OrganizerCrudHeader
        title="Healthcare Coverage"
        description="Review, search, filter, and manage healthcare coverage records for this tax organizer."
        addLabel="Add Coverage"
        onAdd={
          onAdd
        }
      />

      <OrganizerSummaryDashboard
        title="Healthcare Summary"
        description="Monitor healthcare coverage records and supporting tax documents."
        progressPercentage={
          completionPercentage
        }
        metrics={[
          {
            key:
              "coverages",
            label:
              "Coverage Records",
            value:
              coverages.length,
            description:
              "Total healthcare records",
          },
          {
            key:
              "complete",
            label:
              "Completed",
            value:
              completeCount,
            description:
              "Records ready for review",
          },
          {
            key:
              "documents",
            label:
              "Documents",
            value:
              `${receivedDocumentCount}/${coverages.length}`,
            description:
              "Supporting documents received",
          },
          {
            key:
              "marketplace",
            label:
              "Marketplace",
            value:
              marketplaceCount,
            description:
              "Potential Form 1095-A records",
          },
        ]}
      />

      <OrganizerToolbar
        searchValue={
          searchValue
        }
        searchPlaceholder="Search by provider, covered person, policy, type, status, or notes..."
        onSearchChange={
          setSearchValue
        }
        onSearchClear={
          clearSearch
        }
        resultCount={
          resultCount
        }
        totalCount={
          totalCount
        }
        filterKey={
          filterKey
        }
        filters={
          filterChips
        }
        onFilterChange={
          setFilterKey
        }
        sortKey={
          sortKey
        }
        sortOptions={
          healthcareSortOptions
        }
        onSortChange={
          setSortKey
        }
      />

      {visibleItems.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Matching Coverage
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            No healthcare coverage records match the current search and filter
            settings.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {searchValue && (
              <button
                type="button"
                onClick={
                  clearSearch
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Clear Search
              </button>
            )}

            {filterKey !==
              "all" && (
              <button
                type="button"
                onClick={() => {
                  setFilterKey(
                    "all",
                  )
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
            (coverage) => (
              <HealthcareCoverageCard
                key={
                  coverage.coverageId
                }
                coverage={
                  coverage
                }
                onEdit={
                  onEdit
                }
                onDelete={
                  onDelete
                }
              />
            ),
          )}
        </div>
      )}
    </section>
  )
}