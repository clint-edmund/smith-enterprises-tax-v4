import type {
  GeneratedClient,
} from "../models/generated-client"

import type {
  AtlasReturnType,
  AtlasTaxFormType,
  GeneratedReturn,
} from "../models/generated-return"

import {
  getIntelligenceProfile,
} from "../simulation/intelligence-profiles"

import {
  simulationDateOnlyOffset,
  simulationDateOffset,
} from "../simulation/clock"

import type {
  SeededRandom,
} from "../utils/random"

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
    client.scenario ===
    "small_business"
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

function getActiveActivityOffset(
  profile:
    GeneratedReturn["intelligenceProfile"],
): number {
  switch (profile) {
    case "critical":
      return -18

    case "high":
      return -2

    case "medium":
      return -4

    case "low":
      return -1

    case "review":
      return -2

    case "on_hold":
      return -10

    case "completed":
      return -35

    case "historical":
      return -365
  }
}

export function createReturn(
  client: GeneratedClient,
  index: number,
  taxYear: number,
  random: SeededRandom,
): GeneratedReturn {
  /*
   * The client number range begins at 900001,
   * so this gives us a stable 1-based position
   * for deterministic intelligence profiles.
   */
  const clientPosition =
    client.clientNumber -
    900000

  const profile =
    getIntelligenceProfile(
      clientPosition,
      taxYear,
    )

  const returnType =
    getReturnType(
      client,
    )

  const taxForm =
    getTaxForm(
      client,
    )

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

  /*
   * Date received reflects the actual filing
   * season associated with the return year.
   */
  const dateReceivedDate =
    random.dateBetween(
      new Date(
        `${taxYear + 1}-01-05T00:00:00Z`,
      ),

      new Date(
        `${taxYear + 1}-04-10T00:00:00Z`,
      ),
    )

  /*
   * Historical returns retain their normal
   * April deadline.
   *
   * Active 2025 returns use dates around the
   * simulation clock so dashboard due-date
   * intelligence has meaningful variation.
   */
  const dueDate =
    taxYear <= 2024
      ? `${taxYear + 1}-04-15`
      : simulationDateOnlyOffset(
          profile.dueOffsetDays,
        )

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

  /*
   * Active returns derive recent activity from
   * the simulation clock so risk scoring can
   * distinguish stale and healthy work.
   */
  const workflowChangedAt =
    taxYear <= 2024
      ? new Date(
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
      : simulationDateOffset(
          getActiveActivityOffset(
            profile.profile,
          ),
        )

  const assignedPreparerEmail =
    profile.assignPreparer
      ? client.scenario ===
          "simple_w2"
        ? "junior.preparer@atlas.local"
        : "senior.preparer@atlas.local"
      : null

  const assignedReviewerEmail =
    profile.assignReviewer
      ? "reviewer@atlas.local"
      : null

  const isCompleted =
    profile.workflowStatus ===
    "completed"

  const isFiled =
    profile.workflowStatus ===
      "filed" ||
    isCompleted

  const filedDate =
    isFiled
      ? isoDate(
          new Date(
            workflowChangedAt.getTime() -
              3 *
                24 *
                60 *
                60 *
                1000,
          ),
        )
      : null

  const acceptedDate =
    isCompleted &&
    filedDate
      ? isoDate(
          new Date(
            new Date(
              `${filedDate}T12:00:00Z`,
            ).getTime() +
              random.integer(
                1,
                3,
              ) *
                24 *
                60 *
                60 *
                1000,
          ),
        )
      : null

  const extensionFiled =
    profile.profile ===
      "on_hold" &&
    random.chance(
      0.5,
    )

  return {
    clientNumber:
      client.clientNumber,

    taxYear,

    intelligenceProfile:
      profile.profile,

    returnType,

    taxForm,

    filingStatus:
      client.filingStatus,

    status:
      profile.status,

    workflowStatus:
      profile.workflowStatus,

    assignedPreparerEmail,

    assignedReviewerEmail,

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

    federalReturnRequired:
      true,

    stateReturnRequired:
      random.chance(
        0.85,
      ),

    localReturnRequired:
      random.chance(
        0.08,
      ),

    extensionFiled,

    extensionDate:
      extensionFiled
        ? `${taxYear + 1}-04-15`
        : null,

    workflowStatusChangedAt:
      workflowChangedAt.toISOString(),

    assignedAt:
      assignedPreparerEmail
        ? dateReceivedDate.toISOString()
        : null,

    workflowHoldReason:
      profile.holdReason,

    workflowHeldAt:
      profile.workflowStatus ===
        "on_hold"
        ? workflowChangedAt.toISOString()
        : null,

    workflowCompletedAt:
      isCompleted
        ? workflowChangedAt.toISOString()
        : null,

    description:
      `${taxYear} ${taxForm} tax return`,

    notes:
      [
        "Atlas development return.",
        `Scenario: ${client.scenario}.`,
        `Intelligence profile: ${profile.profile}.`,
      ].join(" "),

    createdAt:
      createdAtDate.toISOString(),

    updatedAt:
      workflowChangedAt.toISOString(),
  }
}