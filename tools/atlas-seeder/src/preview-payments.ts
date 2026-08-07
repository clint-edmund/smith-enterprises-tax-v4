import {
  generatePayments,
} from "./generators/payments"

import {
  generateReturns,
} from "./generators/returns"

function roundCurrency(
  amount: number,
): number {
  return Math.round(
    amount * 100,
  ) / 100
}

function main(): void {
  const returns =
    generateReturns()

  const payments =
    generatePayments()

  console.log("")
  console.log(
    "==============================================",
  )
  console.log(
    " Atlas Payment Factory Preview",
  )
  console.log(
    "==============================================",
  )
  console.log("")

  console.log(
    `Generated Payments: ${payments.length}`,
  )

  const returnFees =
    new Map<string, number>()

  for (
    const taxReturn
    of returns
  ) {
    const key =
      `${taxReturn.clientNumber}:${taxReturn.taxYear}`

    returnFees.set(
      key,
      roundCurrency(
        taxReturn.preparationFee -
          taxReturn.discountAmount,
      ),
    )
  }

  const totals =
    new Map<string, number>()

  const uniqueKeys =
    new Set<string>()

  for (
    const payment
    of payments
  ) {
    const paymentKey =
      [
        payment.clientNumber,
        payment.taxYear,
        payment.paymentSequence,
      ].join(":")

    if (
      uniqueKeys.has(
        paymentKey,
      )
    ) {
      throw new Error(
        `Duplicate payment detected: ${paymentKey}`,
      )
    }

    uniqueKeys.add(
      paymentKey,
    )

    if (
      payment.amount <= 0
    ) {
      throw new Error(
        `Invalid payment amount: ${paymentKey}`,
      )
    }

    const returnKey =
      `${payment.clientNumber}:${payment.taxYear}`

    totals.set(
      returnKey,
      roundCurrency(
        (
          totals.get(
            returnKey,
          ) ?? 0
        ) +
          payment.amount,
      ),
    )
  }

  /*
   * Development payments should never exceed
   * the net preparation fee in v0.2.
   */
  for (
    const [
      returnKey,
      paid,
    ]
    of totals
  ) {
    const fee =
      returnFees.get(
        returnKey,
      )

    if (
      fee === undefined
    ) {
      throw new Error(
        `Payment references unknown return: ${returnKey}`,
      )
    }

    if (
      paid >
      fee + 0.01
    ) {
      throw new Error(
        `Payments exceed fee for ${returnKey}.`,
      )
    }
  }

  console.log(
    `✓ Unique payment records ${payments.length}`,
  )

  console.log(
    "✓ No payment exceeds its return fee",
  )

  console.log("")
  console.log(
    "First 20 Payments",
  )
  console.log(
    "----------------------------------------------",
  )

  for (
    const payment
    of payments.slice(
      0,
      20,
    )
  ) {
    console.log(
      [
        payment.clientNumber,
        payment.taxYear,
        `#${payment.paymentSequence}`,
        payment.paymentDate,
        payment.paymentMethod,
        `$${payment.amount.toFixed(2)}`,
        payment.scenario,
      ].join(
        " | ",
      ),
    )
  }

  console.log("")
  console.log(
    "Scenario Distribution",
  )
  console.log(
    "----------------------------------------------",
  )

  const distribution =
    new Map<
      string,
      number
    >()

  for (
    const payment
    of payments
  ) {
    distribution.set(
      payment.scenario,
      (
        distribution.get(
          payment.scenario,
        ) ?? 0
      ) + 1,
    )
  }

  for (
    const [
      scenario,
      count,
    ]
    of distribution
  ) {
    console.log(
      `${scenario.padEnd(24)} ${count}`,
    )
  }

  const totalCollected =
    payments.reduce(
      (
        total,
        payment,
      ) =>
        total +
        payment.amount,
      0,
    )

  console.log("")
  console.log(
    `Total Simulated Collections: $${totalCollected.toFixed(2)}`,
  )

  console.log("")
  console.log(
    "✅ Atlas Payment Factory validation passed.",
  )
  console.log("")
}

main()