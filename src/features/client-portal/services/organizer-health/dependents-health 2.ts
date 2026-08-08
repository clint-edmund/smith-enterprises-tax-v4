import type {
  OrganizerHealthIssue,
  OrganizerSectionHealth,
} from "@/features/client-portal/types/organizer-health.types"

import type {
  OrganizerDependent,
} from "@/features/client-portal/types/organizer-dependent.types"

interface CalculateDependentsHealthOptions {
  dependents:
    readonly OrganizerDependent[]

  sectionTitle?: string
}

function getDependentName(
  dependent:
    OrganizerDependent,
): string {
  return [
    dependent.firstName,
    dependent.middleName,
    dependent.lastName,
    dependent.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

function calculateAge(
  birthDate: string,
): number | null {
  const parsedBirthDate =
    new Date(
      `${birthDate}T00:00:00`,
    )

  if (
    Number.isNaN(
      parsedBirthDate.getTime(),
    )
  ) {
    return null
  }

  const today =
    new Date()

  let age =
    today.getFullYear() -
    parsedBirthDate.getFullYear()

  const monthDifference =
    today.getMonth() -
    parsedBirthDate.getMonth()

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        parsedBirthDate.getDate()
    )
  ) {
    age -= 1
  }

  return age
}

function createMissingBirthDateIssue(
  dependent:
    OrganizerDependent,
): OrganizerHealthIssue {
  return {
    issueId:
      `dependent-birth-date-${dependent.dependentId}`,

    sectionKey:
      "dependents",

    severity:
      "blocking",

    title:
      `${getDependentName(
        dependent,
      )} is missing a birth date`,

    description:
      "A valid birth date is required to determine dependent eligibility.",

    recordId:
      dependent.dependentId,

    fieldKey:
      "birth_date",

    actionLabel:
      "Review Dependent",

    actionPath:
      "/client/organizer/dependents",
  }
}

function createInvalidMonthsIssue(
  dependent:
    OrganizerDependent,
): OrganizerHealthIssue {
  return {
    issueId:
      `dependent-months-${dependent.dependentId}`,

    sectionKey:
      "dependents",

    severity:
      "blocking",

    title:
      `${getDependentName(
        dependent,
      )} has an invalid residency period`,

    description:
      "Months lived with the taxpayer must be between 0 and 12.",

    recordId:
      dependent.dependentId,

    fieldKey:
      "months_lived_with_taxpayer",

    actionLabel:
      "Review Residency",

    actionPath:
      "/client/organizer/dependents",
  }
}

function createClaimedElsewhereIssue(
  dependent:
    OrganizerDependent,
): OrganizerHealthIssue {
  return {
    issueId:
      `dependent-claimed-elsewhere-${dependent.dependentId}`,

    sectionKey:
      "dependents",

    severity:
      "warning",

    title:
      `${getDependentName(
        dependent,
      )} may be claimed by another taxpayer`,

    description:
      "The tax preparer should review whether this person qualifies as a dependent on this return.",

    recordId:
      dependent.dependentId,

    fieldKey:
      "claimed_by_another_taxpayer",

    actionLabel:
      "Review Claim Status",

    actionPath:
      "/client/organizer/dependents",
  }
}

function createResidencyReviewIssue(
  dependent:
    OrganizerDependent,
): OrganizerHealthIssue {
  return {
    issueId:
      `dependent-residency-review-${dependent.dependentId}`,

    sectionKey:
      "dependents",

    severity:
      "warning",

    title:
      `${getDependentName(
        dependent,
      )} did not live with the taxpayer all year`,

    description:
      `The dependent lived with the taxpayer for ${dependent.monthsLivedWithTaxpayer} month${
        dependent.monthsLivedWithTaxpayer === 1
          ? ""
          : "s"
      }. Residency eligibility should be reviewed.`,

    recordId:
      dependent.dependentId,

    fieldKey:
      "lived_with_taxpayer_all_year",

    actionLabel:
      "Review Residency",

    actionPath:
      "/client/organizer/dependents",
  }
}

function createStudentAgeIssue(
  dependent:
    OrganizerDependent,
  age: number,
): OrganizerHealthIssue {
  return {
    issueId:
      `dependent-student-age-${dependent.dependentId}`,

    sectionKey:
      "dependents",

    severity:
      "warning",

    title:
      `${getDependentName(
        dependent,
      )} requires student-status review`,

    description:
      `This dependent is age ${age} and marked as a full-time student. The tax preparer should confirm eligibility requirements.`,

    recordId:
      dependent.dependentId,

    fieldKey:
      "is_full_time_student",

    actionLabel:
      "Review Student Status",

    actionPath:
      "/client/organizer/dependents",
  }
}

function createNoDependentsIssue():
  OrganizerHealthIssue {
  return {
    issueId:
      "dependents-no-records",

    sectionKey:
      "dependents",

    severity:
      "information",

    title:
      "No dependents have been added",

    description:
      "Add each child, relative, or other person who may qualify as a dependent for this tax year.",

    recordId:
      null,

    fieldKey:
      null,

    actionLabel:
      "Add Dependent",

    actionPath:
      "/client/organizer/dependents",
  }
}

function isDependentComplete(
  dependent:
    OrganizerDependent,
): boolean {
  const hasRequiredNames =
    dependent.firstName.trim().length > 0 &&
    dependent.lastName.trim().length > 0

  const hasRelationship =
    dependent.relationship.trim().length > 0

  const hasValidBirthDate =
    calculateAge(
      dependent.birthDate,
    ) !== null

  const hasValidResidency =
    dependent.monthsLivedWithTaxpayer >= 0 &&
    dependent.monthsLivedWithTaxpayer <= 12

  return (
    hasRequiredNames &&
    hasRelationship &&
    hasValidBirthDate &&
    hasValidResidency
  )
}

function getLatestUpdatedAt(
  dependents:
    readonly OrganizerDependent[],
): string | null {
  return dependents.reduce<
    string | null
  >(
    (
      latestValue,
      dependent,
    ) => {
      if (!latestValue) {
        return dependent.updatedAt
      }

      const latestDate =
        new Date(
          latestValue,
        ).getTime()

      const currentDate =
        new Date(
          dependent.updatedAt,
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
        return dependent.updatedAt
      }

      return latestValue
    },
    null,
  )
}

export function calculateDependentsHealth({
  dependents,
  sectionTitle =
    "Dependents",
}: CalculateDependentsHealthOptions):
  OrganizerSectionHealth {
  const recordCount =
    dependents.length

  const completedRecordCount =
    dependents.filter(
      isDependentComplete,
    ).length

  const issues:
    OrganizerHealthIssue[] = []

  if (recordCount === 0) {
    issues.push(
      createNoDependentsIssue(),
    )
  }

  for (
    const dependent
    of dependents
  ) {
    const age =
      calculateAge(
        dependent.birthDate,
      )

    if (age === null) {
      issues.push(
        createMissingBirthDateIssue(
          dependent,
        ),
      )
    }

    if (
      dependent.monthsLivedWithTaxpayer < 0 ||
      dependent.monthsLivedWithTaxpayer > 12
    ) {
      issues.push(
        createInvalidMonthsIssue(
          dependent,
        ),
      )
    }

    if (
      dependent.claimedByAnotherTaxpayer
    ) {
      issues.push(
        createClaimedElsewhereIssue(
          dependent,
        ),
      )
    }

    if (
      !dependent.livedWithTaxpayerAllYear &&
      dependent.monthsLivedWithTaxpayer <
        12
    ) {
      issues.push(
        createResidencyReviewIssue(
          dependent,
        ),
      )
    }

    if (
      age !== null &&
      dependent.isFullTimeStudent &&
      age >= 19
    ) {
      issues.push(
        createStudentAgeIssue(
          dependent,
          age,
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

  const progressPercentage =
    recordCount === 0
      ? 0
      : Math.round(
          (
            completedRecordCount /
            recordCount
          ) * 100,
        )

  const isReadyForReview =
    recordCount > 0 &&
    completedRecordCount ===
      recordCount &&
    blockingIssueCount === 0

  const healthLevel =
    recordCount === 0
      ? "not_started"
      : isReadyForReview
        ? "complete"
        : blockingIssueCount > 0
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
      "dependents",

    sectionTitle,

    sectionStatus,

    healthLevel,

    progressPercentage,

    recordCount,

    completedRecordCount,

    missingDocumentCount:
      0,

    issueCount,

    blockingIssueCount,

    lastUpdatedAt:
      getLatestUpdatedAt(
        dependents,
      ),

    isReadyForReview,

    issues,
  }
}