import type {
  RequiredReturnDocument,
} from "@/features/documents/types/required-document.types"
import type {
  TaxReturnDetails,
} from "@/features/returns/types/return.types"

import type {
  ReadinessCheck,
  ReadinessConfidence,
  ReadinessIssue,
  ReturnReadinessResult,
  ReturnReadinessStatus,
} from "./readiness.types"

interface CalculateReturnReadinessInput {
  taxReturn: TaxReturnDetails
  requiredDocuments: RequiredReturnDocument[]
}

function createIssue(
  id: string,
  severity: ReadinessIssue["severity"],
  title: string,
  description: string,
  actionLabel?: string,
): ReadinessIssue {
  return {
    id,
    severity,
    title,
    description,
    actionLabel,
  }
}

function calculateWeightedScore(
  checks: ReadinessCheck[],
): number {
  const applicableChecks = checks.filter(
    (check) =>
      check.status !== "not_applicable",
  )

  const totalWeight = applicableChecks.reduce(
    (total, check) =>
      total + check.weight,
    0,
  )

  if (totalWeight === 0) {
    return 0
  }

  const earnedScore = applicableChecks.reduce(
    (total, check) =>
      total +
      (
        check.score *
        check.weight
      ) /
        100,
    0,
  )

  return Math.round(
    (earnedScore / totalWeight) * 100,
  )
}

function getReadinessConfidence(
  score: number,
  blockerCount: number,
): ReadinessConfidence {
  if (
    blockerCount === 0 &&
    score >= 90
  ) {
    return "high"
  }

  if (
    blockerCount <= 1 &&
    score >= 65
  ) {
    return "medium"
  }

  return "low"
}

function getReadinessStatus(
  score: number,
  blockerCount: number,
): ReturnReadinessStatus {
  if (blockerCount > 0) {
    return "blocked"
  }

  if (score >= 85) {
    return "ready"
  }

  return "attention"
}

function determineNextAction(
  blockers: ReadinessIssue[],
  warnings: ReadinessIssue[],
): string {
  if (blockers.length > 0) {
    return blockers[0].actionLabel ??
      blockers[0].title
  }

  if (warnings.length > 0) {
    return warnings[0].actionLabel ??
      warnings[0].title
  }

  return "Begin tax-return preparation"
}

export function calculateReturnReadiness({
  taxReturn,
  requiredDocuments,
}: CalculateReturnReadinessInput): ReturnReadinessResult {
  const blockers: ReadinessIssue[] = []
  const warnings: ReadinessIssue[] = []
  const recommendations: ReadinessIssue[] = []

  const requiredItems =
    requiredDocuments.filter(
      (document) => document.isRequired,
    )

  const completedRequiredItems =
    requiredItems.filter(
      (document) => document.isComplete,
    )

  const missingRequiredItems =
    requiredItems.filter(
      (document) => !document.isComplete,
    )

  const requiredDocumentPercent =
    requiredItems.length === 0
      ? 100
      : Math.round(
          (
            completedRequiredItems.length /
            requiredItems.length
          ) *
            100,
        )

  const hasClientName =
    Boolean(
      taxReturn.clientFirstName.trim(),
    ) &&
    Boolean(
      taxReturn.clientLastName.trim(),
    )

  const hasClientContact =
    Boolean(
      taxReturn.clientEmail?.trim(),
    ) ||
    Boolean(
      taxReturn.clientPhone?.trim(),
    )

  let clientScore = 0

  if (hasClientName) {
    clientScore += 60
  }

  if (hasClientContact) {
    clientScore += 40
  }

  if (!hasClientName) {
    blockers.push(
      createIssue(
        "client-name-missing",
        "blocker",
        "Client name is incomplete",
        "The client record must include a first and last name.",
        "Complete client information",
      ),
    )
  }

  if (!hasClientContact) {
    warnings.push(
      createIssue(
        "client-contact-missing",
        "warning",
        "Client contact information is missing",
        "Add an email address or phone number so the office can contact the client.",
        "Add client contact information",
      ),
    )
  }

  if (missingRequiredItems.length > 0) {
    blockers.push(
      createIssue(
        "required-documents-missing",
        "blocker",
        "Required documents are missing",
        `${missingRequiredItems.length} required ${
          missingRequiredItems.length === 1
            ? "document has"
            : "documents have"
        } not been completed.`,
        "Collect missing documents",
      ),
    )
  }

  if (!taxReturn.assignedPreparerId) {
    blockers.push(
      createIssue(
        "preparer-unassigned",
        "blocker",
        "No preparer is assigned",
        "A preparer must be assigned before work can begin.",
        "Assign a preparer",
      ),
    )
  }

  if (!taxReturn.assignedReviewerId) {
    warnings.push(
      createIssue(
        "reviewer-unassigned",
        "warning",
        "No reviewer is assigned",
        "Assigning a reviewer now can reduce delays later in the workflow.",
        "Assign a reviewer",
      ),
    )
  }

  const hasFilingRequirement =
    taxReturn.federalReturnRequired ||
    taxReturn.stateReturnRequired ||
    taxReturn.localReturnRequired

  if (!hasFilingRequirement) {
    warnings.push(
      createIssue(
        "filing-requirements-empty",
        "warning",
        "No filing requirements are selected",
        "Confirm whether a federal, state, or local return is required.",
        "Review filing requirements",
      ),
    )
  }

  if (
    taxReturn.extensionFiled &&
    !taxReturn.extensionDate
  ) {
    warnings.push(
      createIssue(
        "extension-date-missing",
        "warning",
        "Extension date is missing",
        "An extension is marked as filed, but no extension filing date is recorded.",
        "Add extension date",
      ),
    )
  }

  if (taxReturn.netFee <= 0) {
    warnings.push(
      createIssue(
        "fee-not-configured",
        "warning",
        "Preparation fee is not configured",
        "Confirm the preparation fee and discount before completing the return.",
        "Review financial information",
      ),
    )
  }

  if (
    taxReturn.workflowStatus ===
    "on_hold"
  ) {
    blockers.push(
      createIssue(
        "workflow-on-hold",
        "blocker",
        "Return is on hold",
        taxReturn.workflowHoldReason?.trim() ||
          "This return must be removed from hold before preparation can continue.",
        "Resolve the workflow hold",
      ),
    )
  }

  if (
    taxReturn.workflowStatus ===
      "filed" ||
    taxReturn.workflowStatus ===
      "completed"
  ) {
    recommendations.push(
      createIssue(
        "return-already-processed",
        "recommendation",
        "Return has already progressed beyond preparation",
        "This readiness result is informational because the return is already filed or completed.",
      ),
    )
  }

  const checks: ReadinessCheck[] = [
    {
      key: "client_information",
      label: "Client Information",
      description:
        hasClientContact
          ? "Client identity and contact information are available."
          : "Client contact information needs attention.",
      status:
        !hasClientName
          ? "blocked"
          : hasClientContact
            ? "complete"
            : "attention",
      score: clientScore,
      weight: 15,
      blocking: !hasClientName,
    },
    {
      key: "required_documents",
      label: "Required Documents",
      description:
        missingRequiredItems.length === 0
          ? "All required documents are complete."
          : `${missingRequiredItems.length} required ${
              missingRequiredItems.length === 1
                ? "document is"
                : "documents are"
            } outstanding.`,
      status:
        missingRequiredItems.length === 0
          ? "complete"
          : "blocked",
      score: requiredDocumentPercent,
      weight: 35,
      blocking:
        missingRequiredItems.length > 0,
    },
    {
      key: "preparer_assignment",
      label: "Preparer Assignment",
      description:
        taxReturn.assignedPreparerName
          ? `${taxReturn.assignedPreparerName} is assigned as preparer.`
          : "No preparer is assigned.",
      status:
        taxReturn.assignedPreparerId
          ? "complete"
          : "blocked",
      score:
        taxReturn.assignedPreparerId
          ? 100
          : 0,
      weight: 15,
      blocking:
        !taxReturn.assignedPreparerId,
    },
    {
      key: "reviewer_assignment",
      label: "Reviewer Assignment",
      description:
        taxReturn.assignedReviewerName
          ? `${taxReturn.assignedReviewerName} is assigned as reviewer.`
          : "No reviewer is assigned.",
      status:
        taxReturn.assignedReviewerId
          ? "complete"
          : "attention",
      score:
        taxReturn.assignedReviewerId
          ? 100
          : 40,
      weight: 5,
      blocking: false,
    },
    {
      key: "filing_requirements",
      label: "Filing Requirements",
      description:
        hasFilingRequirement
          ? "At least one filing requirement is configured."
          : "No filing requirements are configured.",
      status:
        hasFilingRequirement
          ? "complete"
          : "attention",
      score:
        hasFilingRequirement
          ? 100
          : 25,
      weight: 10,
      blocking: false,
    },
    {
      key: "financial_setup",
      label: "Financial Setup",
      description:
        taxReturn.netFee > 0
          ? "Preparation fee information is configured."
          : "Preparation fee information needs review.",
      status:
        taxReturn.netFee > 0
          ? "complete"
          : "attention",
      score:
        taxReturn.netFee > 0
          ? 100
          : 40,
      weight: 5,
      blocking: false,
    },
    {
      key: "workflow_status",
      label: "Workflow Status",
      description:
        taxReturn.workflowStatus ===
        "on_hold"
          ? "The return is currently on hold."
          : `Current workflow status: ${taxReturn.workflowStatus.replace(
              /_/g,
              " ",
            )}.`,
      status:
        taxReturn.workflowStatus ===
        "on_hold"
          ? "blocked"
          : "complete",
      score:
        taxReturn.workflowStatus ===
        "on_hold"
          ? 0
          : 100,
      weight: 15,
      blocking:
        taxReturn.workflowStatus ===
        "on_hold",
    },
  ]

  const score =
    calculateWeightedScore(checks)

  const status =
    getReadinessStatus(
      score,
      blockers.length,
    )

  const confidence =
    getReadinessConfidence(
      score,
      blockers.length,
    )

  const isReadyToPrepare =
    status === "ready" &&
    blockers.length === 0

  if (
    isReadyToPrepare &&
    taxReturn.workflowStatus ===
      "documents_pending"
  ) {
    recommendations.push(
      createIssue(
        "advance-workflow",
        "recommendation",
        "Advance the workflow",
        "All current readiness requirements are satisfied.",
        "Move to Ready for Preparation",
      ),
    )
  }

  return {
    score,
    status,
    confidence,
    isReadyToPrepare,
    nextAction:
      determineNextAction(
        blockers,
        warnings,
      ),
    checks,
    blockers,
    warnings,
    recommendations,
    requiredDocumentTotal:
      requiredItems.length,
    requiredDocumentCompleted:
      completedRequiredItems.length,
  }
}