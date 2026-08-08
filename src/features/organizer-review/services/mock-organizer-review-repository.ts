import type {
  OrganizerReviewRepository,
} from "./organizer-review-repository"

import type {
  OrganizerReviewOverview,
} from "../types"

function createMockOverview(
  clientId: string,
  taxYear: number,
): OrganizerReviewOverview {
  return {
    organizerId:
      "mock-organizer-id",

    clientId,

    taxYear,

    organizerStatus:
      "in_progress",

    currentSection:
      "healthcare",

    overallProgressPercentage:
      78,

    totalSectionCount:
      3,

    completedSectionCount:
      2,

    inProgressSectionCount:
      1,

    needsAttentionSectionCount:
      1,

    missingDocumentCount:
      1,

    totalIssueCount:
      2,

    blockingIssueCount:
      1,

    isReadyForReview:
      false,

    lastUpdatedAt:
      new Date().toISOString(),

    client: {
      clientId,

      clientNumber:
        "CLIENT-100245",

      clientName:
        "Sample Client",

      email:
        "sample.client@example.com",

      phone:
        "(703) 555-1212",
    },

    sections: [
      {
        sectionKey:
          "dependents",

        sectionTitle:
          "Dependents",

        sectionStatus:
          "completed",

        healthLevel:
          "complete",

        progressPercentage:
          100,

        recordCount:
          2,

        completedRecordCount:
          2,

        missingDocumentCount:
          0,

        issueCount:
          0,

        blockingIssueCount:
          0,

        lastUpdatedAt:
          new Date().toISOString(),

        isReadyForReview:
          true,

        issues: [],
      },

      {
        sectionKey:
          "income",

        sectionTitle:
          "Income",

        sectionStatus:
          "completed",

        healthLevel:
          "complete",

        progressPercentage:
          100,

        recordCount:
          3,

        completedRecordCount:
          3,

        missingDocumentCount:
          0,

        issueCount:
          0,

        blockingIssueCount:
          0,

        lastUpdatedAt:
          new Date().toISOString(),

        isReadyForReview:
          true,

        issues: [],
      },

      {
        sectionKey:
          "healthcare",

        sectionTitle:
          "Healthcare",

        sectionStatus:
          "needs_review",

        healthLevel:
          "needs_attention",

        progressPercentage:
          35,

        recordCount:
          1,

        completedRecordCount:
          0,

        missingDocumentCount:
          1,

        issueCount:
          2,

        blockingIssueCount:
          1,

        lastUpdatedAt:
          new Date().toISOString(),

        isReadyForReview:
          false,

        issues: [
          {
            issueId:
              "mock-healthcare-document",

            sectionKey:
              "healthcare",

            severity:
              "blocking",

            title:
              "Marketplace healthcare document is missing",

            description:
              "The client reported Marketplace coverage, but Form 1095-A has not been received.",

            recordId:
              "mock-healthcare-record",

            fieldKey:
              "document_received",

            actionLabel:
              "Review Healthcare",

            actionPath:
              null,
          },

          {
            issueId:
              "mock-healthcare-review",

            sectionKey:
              "healthcare",

            severity:
              "warning",

            title:
              "Healthcare coverage requires review",

            description:
              "Confirm the reported coverage period and supporting document type.",

            recordId:
              "mock-healthcare-record",

            fieldKey:
              "record_status",

            actionLabel:
              "Review Coverage",

            actionPath:
              null,
          },
        ],
      },
    ],
  }
}

export const mockOrganizerReviewRepository:
  OrganizerReviewRepository = {
    async getOverview(
      clientId: string,
      taxYear: number,
    ): Promise<OrganizerReviewOverview> {
      return createMockOverview(
        clientId,
        taxYear,
      )
    },
  }