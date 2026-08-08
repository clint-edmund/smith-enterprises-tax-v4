import {
  incomeTypeMetadata,
} from "@/features/client-portal/constants/income.constants"

import type {
  OrganizerHealthIssue,
  OrganizerSectionHealth,
} from "@/features/client-portal/types/organizer-health.types"

import type {
  OrganizerIncomeSource,
} from "@/features/client-portal/types/organizer-income.types"

interface CalculateIncomeHealthOptions {
  incomeSources:
    readonly OrganizerIncomeSource[]

  sectionTitle?: string
}

function getIncomeTypeTitle(
  incomeSource:
    OrganizerIncomeSource,
): string {
  const metadata =
    incomeTypeMetadata.find(
      (item) =>
        item.type ===
        incomeSource.incomeType,
    )

  return (
    metadata?.shortTitle ??
    metadata?.title ??
    incomeSource.incomeType
  )
}

function createDraftIssue(
  incomeSource:
    OrganizerIncomeSource,
): OrganizerHealthIssue {
  return {
    issueId:
      `income-draft-${incomeSource.incomeSourceId}`,

    sectionKey:
      "income",

    severity:
      "blocking",

    title:
      `${incomeSource.payerName} is incomplete`,

    description:
      `The ${getIncomeTypeTitle(
        incomeSource,
      )} income record is still saved as a draft.`,

    recordId:
      incomeSource.incomeSourceId,

    fieldKey:
      "record_status",

    actionLabel:
      "Review Income Source",

    actionPath:
      "/client/organizer/income",
  }
}

function createNeedsReviewIssue(
  incomeSource:
    OrganizerIncomeSource,
): OrganizerHealthIssue {
  return {
    issueId:
      `income-review-${incomeSource.incomeSourceId}`,

    sectionKey:
      "income",

    severity:
      "warning",

    title:
      `${incomeSource.payerName} needs review`,

    description:
      `The ${getIncomeTypeTitle(
        incomeSource,
      )} income record has been marked for additional review.`,

    recordId:
      incomeSource.incomeSourceId,

    fieldKey:
      "record_status",

    actionLabel:
      "Review Income Source",

    actionPath:
      "/client/organizer/income",
  }
}

function createMissingDocumentIssue(
  incomeSource:
    OrganizerIncomeSource,
): OrganizerHealthIssue {
  return {
    issueId:
      `income-document-${incomeSource.incomeSourceId}`,

    sectionKey:
      "income",

    severity:
      "blocking",

    title:
      `${incomeSource.payerName} document is missing`,

    description:
      `The supporting ${getIncomeTypeTitle(
        incomeSource,
      )} document has not been marked as received.`,

    recordId:
      incomeSource.incomeSourceId,

    fieldKey:
      "document_received",

    actionLabel:
      "Review Document Status",

    actionPath:
      "/client/organizer/income",
  }
}

function createNoIncomeIssue():
  OrganizerHealthIssue {
  return {
    issueId:
      "income-no-records",

    sectionKey:
      "income",

    severity:
      "information",

    title:
      "No income sources have been added",

    description:
      "Add each W-2, 1099, benefit statement, retirement statement, or other income source that applies to this tax year.",

    recordId:
      null,

    fieldKey:
      null,

    actionLabel:
      "Add Income Source",

    actionPath:
      "/client/organizer/income",
  }
}

export function calculateIncomeHealth({
  incomeSources,
  sectionTitle =
    "Income",
}: CalculateIncomeHealthOptions):
  OrganizerSectionHealth {
  const recordCount =
    incomeSources.length

  const completedRecordCount =
    incomeSources.filter(
      (incomeSource) =>
        incomeSource.recordStatus ===
        "complete",
    ).length

  const draftRecordCount =
    incomeSources.filter(
      (incomeSource) =>
        incomeSource.recordStatus ===
        "draft",
    ).length

  const needsReviewRecordCount =
    incomeSources.filter(
      (incomeSource) =>
        incomeSource.recordStatus ===
        "needs_review",
    ).length

  const missingDocumentCount =
    incomeSources.filter(
      (incomeSource) =>
        !incomeSource.documentReceived,
    ).length

  const issues:
    OrganizerHealthIssue[] = []

  if (recordCount === 0) {
    issues.push(
      createNoIncomeIssue(),
    )
  }

  for (
    const incomeSource
    of incomeSources
  ) {
    if (
      incomeSource.recordStatus ===
      "draft"
    ) {
      issues.push(
        createDraftIssue(
          incomeSource,
        ),
      )
    }

    if (
      incomeSource.recordStatus ===
      "needs_review"
    ) {
      issues.push(
        createNeedsReviewIssue(
          incomeSource,
        ),
      )
    }

    if (
      !incomeSource.documentReceived
    ) {
      issues.push(
        createMissingDocumentIssue(
          incomeSource,
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
    draftRecordCount === 0 &&
    needsReviewRecordCount === 0 &&
    missingDocumentCount === 0 &&
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
            needsReviewRecordCount > 0
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

  const latestUpdatedAt =
    incomeSources.reduce<
      string | null
    >(
      (
        latestValue,
        incomeSource,
      ) => {
        if (!latestValue) {
          return incomeSource.updatedAt
        }

        const latestDate =
          new Date(
            latestValue,
          ).getTime()

        const currentDate =
          new Date(
            incomeSource.updatedAt,
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
          return incomeSource.updatedAt
        }

        return latestValue
      },
      null,
    )

  return {
    sectionKey:
      "income",

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
      latestUpdatedAt,

    isReadyForReview,

    issues,
  }
}