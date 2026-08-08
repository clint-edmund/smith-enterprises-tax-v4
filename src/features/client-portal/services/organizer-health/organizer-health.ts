import type {
  OrganizerHealthOverview,
  OrganizerSectionHealth,
} from "@/features/client-portal/types/organizer-health.types"

interface CalculateOrganizerHealthOptions {
  organizerId: string
  taxYear: number
  sections: readonly OrganizerSectionHealth[]
}

export function calculateOrganizerHealth({
  organizerId,
  taxYear,
  sections,
}: CalculateOrganizerHealthOptions): OrganizerHealthOverview {
  const totalSectionCount =
    sections.length

  const completedSectionCount =
    sections.filter(
      (section) =>
        section.healthLevel ===
        "complete",
    ).length

  const notStartedSectionCount =
    sections.filter(
      (section) =>
        section.healthLevel ===
        "not_started",
    ).length

  const inProgressSectionCount =
    sections.filter(
      (section) =>
        section.healthLevel ===
        "in_progress",
    ).length

  const needsAttentionSectionCount =
    sections.filter(
      (section) =>
        section.healthLevel ===
        "needs_attention",
    ).length

  const totalIssueCount =
    sections.reduce(
      (
        total,
        section,
      ) =>
        total +
        section.issueCount,
      0,
    )

  const blockingIssueCount =
    sections.reduce(
      (
        total,
        section,
      ) =>
        total +
        section.blockingIssueCount,
      0,
    )

  const missingDocumentCount =
    sections.reduce(
      (
        total,
        section,
      ) =>
        total +
        section.missingDocumentCount,
      0,
    )

  const overallProgressPercentage =
    totalSectionCount === 0
      ? 0
      : Math.round(
          sections.reduce(
            (
              total,
              section,
            ) =>
              total +
              section.progressPercentage,
            0,
          ) /
            totalSectionCount,
        )

  const isReadyForReview =
    totalSectionCount > 0 &&
    sections.every(
      (section) =>
        section.isReadyForReview,
    )

  const lastUpdatedAt =
    sections.reduce<
      string | null
    >(
      (
        latest,
        section,
      ) => {
        if (
          !section.lastUpdatedAt
        ) {
          return latest
        }

        if (!latest) {
          return section.lastUpdatedAt
        }

        return new Date(
          section.lastUpdatedAt,
        ).getTime() >
          new Date(
            latest,
          ).getTime()
          ? section.lastUpdatedAt
          : latest
      },
      null,
    )

  return {
    organizerId,
    taxYear,

    overallProgressPercentage,

    totalSectionCount,

    completedSectionCount,

    inProgressSectionCount,

    notStartedSectionCount,

    needsAttentionSectionCount,

    totalIssueCount,

    blockingIssueCount,

    missingDocumentCount,

    isReadyForReview,

    lastUpdatedAt,

    sections: [
      ...sections,
    ],
  }
}