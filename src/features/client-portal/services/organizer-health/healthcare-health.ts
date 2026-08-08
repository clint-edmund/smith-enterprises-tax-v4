import {
  healthcareCoverageMetadata,
} from "@/features/client-portal/constants/healthcare.constants"

import type {
  OrganizerHealthIssue,
  OrganizerSectionHealth,
} from "@/features/client-portal/types/organizer-health.types"

import type {
  OrganizerHealthcareCoverage,
} from "@/features/client-portal/types/organizer-healthcare.types"

interface CalculateHealthcareHealthOptions {
  coverages:
    readonly OrganizerHealthcareCoverage[]

  sectionTitle?: string
}

function getCoverageTitle(
  coverage:
    OrganizerHealthcareCoverage,
): string {
  return healthcareCoverageMetadata[
    coverage.coverageType
  ].shortTitle
}

function createDraftIssue(
  coverage:
    OrganizerHealthcareCoverage,
): OrganizerHealthIssue {
  return {
    issueId:
      `healthcare-draft-${coverage.coverageId}`,

    sectionKey:
      "healthcare",

    severity:
      "blocking",

    title:
      `${coverage.providerName} coverage is incomplete`,

    description:
      `The ${getCoverageTitle(
        coverage,
      )} coverage record for ${coverage.coveredPersonName} is still saved as a draft.`,

    recordId:
      coverage.coverageId,

    fieldKey:
      "record_status",

    actionLabel:
      "Review Coverage",

    actionPath:
      "/client/organizer/healthcare",
  }
}

function createNeedsReviewIssue(
  coverage:
    OrganizerHealthcareCoverage,
): OrganizerHealthIssue {
  return {
    issueId:
      `healthcare-review-${coverage.coverageId}`,

    sectionKey:
      "healthcare",

    severity:
      "warning",

    title:
      `${coverage.providerName} coverage needs review`,

    description:
      `The ${getCoverageTitle(
        coverage,
      )} coverage record for ${coverage.coveredPersonName} has been marked for additional review.`,

    recordId:
      coverage.coverageId,

    fieldKey:
      "record_status",

    actionLabel:
      "Review Coverage",

    actionPath:
      "/client/organizer/healthcare",
  }
}

function createMissingDocumentIssue(
  coverage:
    OrganizerHealthcareCoverage,
): OrganizerHealthIssue {
  return {
    issueId:
      `healthcare-document-${coverage.coverageId}`,

    sectionKey:
      "healthcare",

    severity:
      coverage.coverageType ===
      "marketplace"
        ? "blocking"
        : "warning",

    title:
      `${coverage.providerName} document is missing`,

    description:
      coverage.coverageType ===
      "marketplace"
        ? "Marketplace coverage requires the supporting Form 1095-A before this section is ready for review."
        : `The supporting document for ${coverage.coveredPersonName}'s coverage has not been marked as received.`,

    recordId:
      coverage.coverageId,

    fieldKey:
      "document_received",

    actionLabel:
      "Review Document Status",

    actionPath:
      "/client/organizer/healthcare",
  }
}

function createNoCoverageIssue():
  OrganizerHealthIssue {
  return {
    issueId:
      "healthcare-no-records",

    sectionKey:
      "healthcare",

    severity:
      "information",

    title:
      "No healthcare coverage has been added",

    description:
      "Add each healthcare policy or government coverage source that applied during the tax year.",

    recordId:
      null,

    fieldKey:
      null,

    actionLabel:
      "Add Coverage",

    actionPath:
      "/client/organizer/healthcare",
  }
}

function getLatestUpdatedAt(
  coverages:
    readonly OrganizerHealthcareCoverage[],
): string | null {
  return coverages.reduce<
    string | null
  >(
    (
      latestValue,
      coverage,
    ) => {
      if (!latestValue) {
        return coverage.updatedAt
      }

      const latestDate =
        new Date(
          latestValue,
        ).getTime()

      const currentDate =
        new Date(
          coverage.updatedAt,
        ).getTime()

      if (
        Number.isNaN(
          currentDate,
        )
      ) {
        return latestValue
      }

      if (
        Number.isNaN(
          latestDate,
        ) ||
        currentDate >
          latestDate
      ) {
        return coverage.updatedAt
      }

      return latestValue
    },
    null,
  )
}

export function calculateHealthcareHealth({
  coverages,
  sectionTitle =
    "Healthcare",
}: CalculateHealthcareHealthOptions):
  OrganizerSectionHealth {
  const recordCount =
    coverages.length

  const completedRecordCount =
    coverages.filter(
      (coverage) =>
        coverage.recordStatus ===
        "complete",
    ).length

  const missingDocumentCount =
    coverages.filter(
      (coverage) =>
        !coverage.documentReceived,
    ).length

  const issues:
    OrganizerHealthIssue[] = []

  if (recordCount === 0) {
    issues.push(
      createNoCoverageIssue(),
    )
  }

  for (
    const coverage
    of coverages
  ) {
    if (
      coverage.recordStatus ===
      "draft"
    ) {
      issues.push(
        createDraftIssue(
          coverage,
        ),
      )
    }

    if (
      coverage.recordStatus ===
      "needs_review"
    ) {
      issues.push(
        createNeedsReviewIssue(
          coverage,
        ),
      )
    }

    if (
      !coverage.documentReceived
    ) {
      issues.push(
        createMissingDocumentIssue(
          coverage,
        ),
      )
    }
  }

  const blockingIssueCount =
    issues.filter(
      (issue) =>
        issue.severity ===
        "blocking",
    ).length

  const issueCount =
    issues.length

  const isReadyForReview =
    recordCount > 0 &&
    completedRecordCount ===
      recordCount &&
    blockingIssueCount === 0

  const progressPercentage =
    recordCount === 0
      ? 0
      : Math.round(
          (
            completedRecordCount /
            recordCount
          ) * 100,
        )

  const healthLevel =
    recordCount === 0
      ? "not_started"
      : isReadyForReview
        ? "complete"
        : blockingIssueCount > 0 ||
            coverages.some(
              (coverage) =>
                coverage.recordStatus ===
                "needs_review",
            )
          ? "needs_attention"
          : "in_progress"

  const sectionStatus =
    healthLevel ===
    "complete"
      ? "completed"
      : healthLevel ===
          "not_started"
        ? "not_started"
        : "in_progress"

  return {
    sectionKey:
      "healthcare",

    sectionTitle,

    sectionStatus,

    healthLevel,

    progressPercentage,

    recordCount,

    completedRecordCount,

    missingDocumentCount,

    issueCount,

    blockingIssueCount,

    lastUpdatedAt:
      getLatestUpdatedAt(
        coverages,
      ),

    isReadyForReview,

    issues,
  }
}
