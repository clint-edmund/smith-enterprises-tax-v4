import type {
  GeneratedPayment,
  AtlasPaymentMethod,
  AtlasPaymentScenario,
} from "../models/generated-payment"

import type {
  GeneratedReturn,
} from "../models/generated-return"

import type {
  SeededRandom,
} from "../utils/random"

const paymentMethods: readonly AtlasPaymentMethod[] = [
  "credit_card",
  "credit_card",
  "credit_card",
  "credit_card",
  "ach",
  "ach",
  "ach",
  "check",
  "check",
  "debit_card",
  "cash",
  "money_order",
  "other",
] as const

function roundCurrency(
  amount: number,
): number {
  return Math.round(
    amount * 100,
  ) / 100
}

function getNetFee(
  taxReturn: GeneratedReturn,
): number {
  return roundCurrency(
    Math.max(
      taxReturn.preparationFee -
        taxReturn.discountAmount,
      0,
    ),
  )
}

function chooseScenario(
  index: number,
): AtlasPaymentScenario {
  const bucket =
    (index - 1) % 20

  if (bucket < 3) {
    return "unpaid"
  }

  if (bucket < 7) {
    return "deposit_only"
  }

  if (bucket < 11) {
    return "partial"
  }

  if (bucket < 17) {
    return "paid_in_full"
  }

  return "multiple_payments"
}

function chooseMethod(
  random: SeededRandom,
): AtlasPaymentMethod {
  return random.pick(
    paymentMethods,
  )
}

function addDays(
  source: string,
  days: number,
): string {
  const date =
    new Date(
      `${source}T12:00:00Z`,
    )

  date.setUTCDate(
    date.getUTCDate() + days,
  )

  return date
    .toISOString()
    .slice(0, 10)
}

function buildPayment(
  taxReturn: GeneratedReturn,
  scenario: AtlasPaymentScenario,
  paymentSequence: number,
  amount: number,
  paymentDate: string,
  random: SeededRandom,
): GeneratedPayment {
  return {
    clientNumber:
      taxReturn.clientNumber,

    taxYear:
      taxReturn.taxYear,

    paymentSequence,

    paymentDate,

    paymentMethod:
      chooseMethod(
        random,
      ),

    amount:
      roundCurrency(
        amount,
      ),

    scenario,

    notes:
      `Atlas development payment. Scenario: ${scenario}.`,
  }
}

export function createPaymentsForReturn(
  taxReturn: GeneratedReturn,
  index: number,
  random: SeededRandom,
): GeneratedPayment[] {
  const fee =
    getNetFee(
      taxReturn,
    )

  if (
    fee <= 0 ||
    !taxReturn.dateReceived
  ) {
    return []
  }

  const scenario =
    chooseScenario(
      index,
    )

  switch (scenario) {
    case "unpaid":
      return []

    case "deposit_only": {
      const deposit =
        Math.min(
          fee,
          random.pick([
            50,
            100,
            150,
            200,
          ] as const),
        )

      return [
        buildPayment(
          taxReturn,
          scenario,
          1,
          deposit,
          addDays(
            taxReturn.dateReceived,
            random.integer(
              0,
              3,
            ),
          ),
          random,
        ),
      ]
    }

    case "partial": {
      const amount =
        roundCurrency(
          fee *
            random.pick([
              0.4,
              0.5,
              0.6,
              0.75,
            ] as const),
        )

      return [
        buildPayment(
          taxReturn,
          scenario,
          1,
          amount,
          addDays(
            taxReturn.dateReceived,
            random.integer(
              1,
              10,
            ),
          ),
          random,
        ),
      ]
    }

    case "paid_in_full":
      return [
        buildPayment(
          taxReturn,
          scenario,
          1,
          fee,
          addDays(
            taxReturn.dateReceived,
            random.integer(
              0,
              20,
            ),
          ),
          random,
        ),
      ]

    case "multiple_payments": {
      const firstAmount =
        roundCurrency(
          fee * 0.4,
        )

      const secondAmount =
        roundCurrency(
          fee -
            firstAmount,
        )

      const firstDate =
        addDays(
          taxReturn.dateReceived,
          random.integer(
            0,
            5,
          ),
        )

      const secondDate =
        addDays(
          firstDate,
          random.integer(
            5,
            30,
          ),
        )

      return [
        buildPayment(
          taxReturn,
          scenario,
          1,
          firstAmount,
          firstDate,
          random,
        ),

        buildPayment(
          taxReturn,
          scenario,
          2,
          secondAmount,
          secondDate,
          random,
        ),
      ]
    }
  }
}