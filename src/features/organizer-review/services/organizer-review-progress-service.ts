import {
  organizerReviewWorkflowSections,
} from "../constants/organizer-review-workflow-sections"

import type {
  OrganizerReviewOverview,
  OrganizerReviewProgress,
  OrganizerReviewProgressSection,
  OrganizerReviewProgressSectionStatus,
} from "../types"

function clampPercentage(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        value,
      ),
    ),
  )
}

function normalizeStatus(
  healthLevel: string,
  sectionStatus: string,
  blockingIssueCount: number,
  issueCount: number,
): OrganizerReviewProgressSectionStatus {
  if (
    blockingIssueCount > 0 ||
    healthLevel ===
      "needs_attention" ||
    sectionStatus ===
      "needs_review"
  ) {
    return "needs_attention"
  }

  if (
    healthLevel ===
      "complete" ||
    sectionStatus ===
      "completed"
  ) {
    return "complete"
  }

  if (
    healthLevel ===
      "in_progress" ||
    sectionStatus ===
      "in_progress"
  ) {
    return "in_progress"
  }

  if (issueCount > 0) {
    return "needs_attention"
  }

  return "not_started"
}

export function getOrganizerReviewSectionRoute(
  clientId: string,
  taxYear: number,
  routeSegment: string,
): string {
  return [
    "/clients",
    encodeURIComponent(
      clientId,
    ),
    "organizer-review",
    taxYear.toString(),
    routeSegment,
  ].join("/")
}

export function getOrganizerReviewProgress(
  overview:
    OrganizerReviewOverview,
): OrganizerReviewProgress {
  const liveSectionMap =
    new Map(
      overview.sections.map(
        (section) => [
          section.sectionKey,
          section,
        ],
      ),
    )

  const sections:
    OrganizerReviewProgressSection[] =
      organizerReviewWorkflowSections
        .map(
          (
            definition,
          ) => {
            const liveSection =
              liveSectionMap.get(
                definition.key,
              )

            if (!liveSection) {
              return {
                key:
                  definition.key,

                title:
                  definition.title,

                description:
                  definition.description,

                href:
                  getOrganizerReviewSectionRoute(
                    overview.clientId,
                    overview.taxYear,
                    definition.routeSegment,
                  ),

                status:
                  "not_started",

                progressPercentage:
                  0,

                issueCount:
                  0,

                blockingIssueCount:
                  0,

                missingDocumentCount:
                  0,

                isReadyForReview:
                  false,

                isRequiredForPreparation:
                  definition.isRequiredForPreparation,

                isImplemented:
                  false,

                displayOrder:
                  definition.displayOrder,
              } satisfies
                OrganizerReviewProgressSection
            }

            return {
              key:
                definition.key,

              title:
                liveSection.sectionTitle ||
                definition.title,

              description:
                definition.description,

              href:
                getOrganizerReviewSectionRoute(
                  overview.clientId,
                  overview.taxYear,
                  definition.routeSegment,
                ),

              status:
                normalizeStatus(
                  liveSection.healthLevel,
                  liveSection.sectionStatus,
                  liveSection.blockingIssueCount,
                  liveSection.issueCount,
                ),

              progressPercentage:
                clampPercentage(
                  liveSection.progressPercentage,
                ),

              issueCount:
                liveSection.issueCount,

              blockingIssueCount:
                liveSection.blockingIssueCount,

              missingDocumentCount:
                liveSection.missingDocumentCount,

              isReadyForReview:
                liveSection.isReadyForReview,

              isRequiredForPreparation:
                definition.isRequiredForPreparation,

              isImplemented:
                true,

              displayOrder:
                definition.displayOrder,
            } satisfies
              OrganizerReviewProgressSection
          },
        )
        .sort(
          (
            first,
            second,
          ) =>
            first.displayOrder -
            second.displayOrder,
        )

  const implementedSections =
    sections.filter(
      (section) =>
        section.isImplemented,
    )

  const requiredSections =
    sections.filter(
      (section) =>
        section.isRequiredForPreparation,
    )

  const completedSections =
    sections.filter(
      (section) =>
        section.status ===
        "complete",
    )

  const completedRequiredSections =
    requiredSections.filter(
      (section) =>
        section.status ===
        "complete",
    )

  const issueCount =
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

  const progressPercentage =
    requiredSections.length ===
    0
      ? 0
      : Math.round(
          (
            completedRequiredSections.length /
            requiredSections.length
          ) * 100,
        )

  const implementedProgressPercentage =
    implementedSections.length ===
    0
      ? 0
      : Math.round(
          (
            implementedSections.filter(
              (section) =>
                section.status ===
                "complete",
            ).length /
            implementedSections.length
          ) * 100,
        )

  const nextSection =
    sections.find(
      (section) =>
        section.isImplemented &&
        section.status !==
          "complete",
    ) ??
    sections.find(
      (section) =>
        !section.isImplemented,
    ) ??
    null

  const isReadyForPreparation =
    requiredSections.length >
      0 &&
    requiredSections.every(
      (section) =>
        section.isImplemented &&
        section.status ===
          "complete",
    ) &&
    blockingIssueCount ===
      0 &&
    missingDocumentCount ===
      0

  return {
    clientId:
      overview.clientId,

    taxYear:
      overview.taxYear,

    sections,

    totalSectionCount:
      sections.length,

    implementedSectionCount:
      implementedSections.length,

    completedSectionCount:
      completedSections.length,

    requiredSectionCount:
      requiredSections.length,

    completedRequiredSectionCount:
      completedRequiredSections.length,

    issueCount,

    blockingIssueCount,

    missingDocumentCount,

    progressPercentage,

    implementedProgressPercentage,

    nextSection,

    isReadyForPreparation,
  }
}
