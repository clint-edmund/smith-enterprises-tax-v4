import {
  generateReturns,
} from "./generators/returns"

function main(): void {
  const returns =
    generateReturns()

  console.log("")
  console.log(
    "==============================================",
  )
  console.log(
    " Atlas Tax Return Factory Preview",
  )
  console.log(
    "==============================================",
  )
  console.log("")

  console.log(
    `Generated Returns: ${returns.length}`,
  )

  const uniqueKeys =
    new Set<string>()

  for (
    const taxReturn
    of returns
  ) {
    const key =
      [
        taxReturn.clientNumber,
        taxReturn.taxYear,
      ].join(":")

    if (
      uniqueKeys.has(
        key,
      )
    ) {
      throw new Error(
        `Duplicate return detected: ${key}`,
      )
    }

    uniqueKeys.add(
      key,
    )

    if (
      taxReturn.discountAmount >
      taxReturn.preparationFee
    ) {
      throw new Error(
        `Invalid discount for ${key}`,
      )
    }

    if (
      taxReturn.estimatedRefund > 0 &&
      taxReturn.estimatedAmountDue > 0
    ) {
      throw new Error(
        `Refund and amount due both populated for ${key}`,
      )
    }

    if (
      taxReturn.extensionFiled &&
      !taxReturn.extensionDate
    ) {
      throw new Error(
        `Missing extension date for ${key}`,
      )
    }
  }

  console.log(
    `✓ Unique client/year returns ${returns.length}`,
  )

  console.log("")
  console.log(
    "First 15 Returns",
  )
  console.log(
    "----------------------------------------------",
  )

  for (
    const taxReturn
    of returns.slice(
      0,
      15,
    )
  ) {
    console.log(
      [
        taxReturn.clientNumber,
        taxReturn.taxYear,
        taxReturn.intelligenceProfile,
        taxReturn.taxForm,
        taxReturn.status,
        taxReturn.workflowStatus,
        taxReturn.dueDate,
        `$${taxReturn.preparationFee.toFixed(2)}`,
      ].join(
        " | ",
      ),
    )
  }

  console.log("")
  console.log(
    "Workflow Distribution",
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
    const taxReturn
    of returns
  ) {
    distribution.set(
      taxReturn.workflowStatus,
      (
        distribution.get(
          taxReturn.workflowStatus,
        ) ?? 0
      ) + 1,
    )
  }

  for (
    const [
      status,
      count,
    ]
    of distribution
  ) {
    console.log(
      `${status.padEnd(24)} ${count}`,
    )
  }

  console.log("")
  console.log(
    "✅ Atlas Tax Return Factory validation passed.",
  )
  console.log("")
}

main()