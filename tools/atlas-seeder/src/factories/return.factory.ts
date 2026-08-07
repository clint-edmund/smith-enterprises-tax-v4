import type {
  GeneratedClient,
} from "../models/generated-client"

import type {
  AtlasReturnStatus,
  AtlasReturnType,
  AtlasTaxFormType,
  AtlasWorkflowStatus,
  GeneratedReturn,
} from "../models/generated-return"

import type {
  SeededRandom,
} from "../utils/random"

interface ReturnLifecycle {
  status: AtlasReturnStatus
  workflowStatus: AtlasWorkflowStatus
}

const lifecycleStates: readonly ReturnLifecycle[] = [
  {
    status: "documents_pending",
    workflowStatus: "documents_pending",
  },
  {
    status: "in_progress",
    workflowStatus: "in_preparation",
  },
  {
    status: "ready_for_review",
    workflowStatus: "review",
  },
  {
    status: "under_review",
    workflowStatus: "review",
  },
  {
    status: "ready_to_file",
    workflowStatus: "ready_to_file",
  },
  {
    status: "filed",
    workflowStatus: "filed",
  },
  {
    status: "accepted",
    workflowStatus: "completed",
  },
  {
    status: "completed",
    workflowStatus: "completed",
  },
  {
    status: "on_hold",
    workflowStatus: "on_hold",
  },
] as const

function isoDate(
  date: Date,
): string {
  return date
    .toISOString()
    .slice(0, 10)
}

function getReturnType(
  client: GeneratedClient,
): AtlasReturnType {
  if (
    client.scenario === "small_business"
  ) {
    return "business"
  }

  return "individual"
}

function getTaxForm(
  client: GeneratedClient,
): AtlasTaxFormType {
  switch (client.scenario) {
    case "small_business":
      return "1120_s"

    case "self_employed":
      return "schedule_c"

    default:
      return "1040"
  }
}

function getLifecycle(
  index: number,
): ReturnLifecycle {
  return lifecycleStates[
    (index - 1) %
      lifecycleStates.length
  ]
}

function getPreparationFee(
  client: GeneratedClient,
  random: SeededRandom,
): number {
  switch (client.scenario) {
    case "simple_w2":
      return random.decimal(
        175,
        350,
        2,
      )

    case "married_family":
      return random.decimal(
        250,
        500,
        2,
      )

    case "retired":
      return random.decimal(
        200,
        425,
        2,
      )

    case "self_employed":
      return random.decimal(
        400,
        850,
        2,
      )

    case "small_business":
      return random.decimal(
        750,
        1500,
        2,
      )

    case "rental_property":
      return random.decimal(
        450,
        900,
        2,
      )

    case "complex_investor":
      return random.decimal(
        550,
        1100,
        2,
      )
  }
}

function getDiscount(
  preparationFee: number,
  random: SeededRandom,
): number {
  if (!random.chance(0.2)) {
    return 0
  }

  const possibleDiscount =
    random.pick([
      25,
      50,
      75,
      100,
    ] as const)

  return Math.min(
    possibleDiscount,
    preparationFee,
  )
}

function getTaxEstimate(
  random: SeededRandom,
): {
  estimatedRefund: number
  estimatedAmountDue: number
} {
  if (random.chance(0.65)) {
    return {
      estimatedRefund:
        random.decimal(
          250,
          6500,
          2,
        ),

      estimatedAmountDue: 0,
    }
  }

  return {
    estimatedRefund: 0,

    estimatedAmountDue:
      random.decimal(
        100,
        5000,
        2,
      ),
  }
}

function shouldAssignReviewer(
  lifecycle: ReturnLifecycle,
): boolean {
  return (
    lifecycle.workflowStatus ===
      "review" ||
    lifecycle.workflowStatus ===
      "ready_to_file" ||
    lifecycle.workflowStatus ===
      "filed" ||
    lifecycle.workflowStatus ===
      "completed"
  )
}

export function createReturn(
  client: GeneratedClient,
  index: number,
  taxYear: number,
  random: SeededRandom,
): GeneratedReturn {
  const lifecycle =
    getLifecycle(index)

  const returnType =
    getReturnType(client)

  const taxForm =
    getTaxForm(client)

  const preparationFee =
    getPreparationFee(
      client,
      random,
    )

  const discountAmount =
    getDiscount(
      preparationFee,
      random,
    )

  const taxEstimate =
    getTaxEstimate(
      random,
    )

  const dateReceivedDate =
    random.dateBetween(
      new Date(
        `${taxYear + 1}-01-05T00:00:00Z`,
      ),
      new Date(
        `${taxYear + 1}-04-10T00:00:00Z`,
      ),
    )

  const dueDate =
    `${taxYear + 1}-04-15`

  const createdAtDate =
    new Date(
      dateReceivedDate.getTime() -
      random.integer(
        0,
        14,
      ) *
        24 *
        60 *
        60 *
        1000,
    )

  const workflowChangedAt =
    new Date(
      dateReceivedDate.getTime() +
      random.integer(
        1,
        45,
      ) *
        24 *
        60 *
        60 *
        1000,
    )

  const isFiled =
    lifecycle.status ===
      "filed" ||
    lifecycle.status ===
      "accepted" ||
    lifecycle.status ===
      "completed"

  const isAccepted =
    lifecycle.status ===
      "accepted" ||
    lifecycle.status ===
      "completed"

  const filedDate =
    isFiled
      ? isoDate(
          new Date(
            workflowChangedAt.getTime() +
            2 *
              24 *
              60 *
              60 *
              1000,
          ),
        )
      : null

  const acceptedDate =
    isAccepted && filedDate
      ? isoDate(
          new Date(
            new Date(
              filedDate,
            ).getTime() +
            random.integer(
              1,
              5,
            ) *
              24 *
              60 *
              60 *
              1000,
          ),
        )
      : null

  const extensionFiled =
    lifecycle.status ===
      "on_hold" &&
    random.chance(0.5)

  return {
    clientNumber:
      client.clientNumber,

    taxYear,

    returnType,

    taxForm,

    filingStatus:
      client.filingStatus,

    status:
      lifecycle.status,

    workflowStatus:
      lifecycle.workflowStatus,

    assignedPreparerEmail:
      client.scenario ===
        "simple_w2"
        ? "junior.preparer@atlas.local"
        : "senior.preparer@atlas.local",

    assignedReviewerEmail:
      shouldAssignReviewer(
        lifecycle,
      )
        ? "reviewer@atlas.local"
        : null,

    dateReceived:
      isoDate(
        dateReceivedDate,
      ),

    dueDate,

    filedDate,
    acceptedDate,

    preparationFee,

    discountAmount,

    estimatedRefund:
      taxEstimate.estimatedRefund,

    estimatedAmountDue:
      taxEstimate.estimatedAmountDue,

    federalReturnRequired: true,

    stateReturnRequired:
      random.chance(0.85),

    localReturnRequired:
      random.chance(0.08),

    extensionFiled,

    extensionDate:
      extensionFiled
        ? `${taxYear + 1}-04-15`
        : null,

    workflowStatusChangedAt:
      workflowChangedAt.toISOString(),

    assignedAt:
      dateReceivedDate.toISOString(),

    workflowHoldReason:
      lifecycle.workflowStatus ===
        "on_hold"
        ? "Waiting on additional client information."
        : null,

    workflowHeldAt:
      lifecycle.workflowStatus ===
        "on_hold"
        ? workflowChangedAt.toISOString()
        : null,

    workflowCompletedAt:
      lifecycle.workflowStatus ===
        "completed"
        ? workflowChangedAt.toISOString()
        : null,

    description:
      `${taxYear} ${taxForm} tax return`,

    notes:
      [
        "Atlas development return.",
        `Scenario: ${client.scenario}.`,
      ].join(" "),

    createdAt:
      createdAtDate.toISOString(),

    updatedAt:
      workflowChangedAt.toISOString(),
  }
}