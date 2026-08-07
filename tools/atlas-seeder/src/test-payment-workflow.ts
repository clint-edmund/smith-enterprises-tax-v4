import {
  createClient,
} from "@supabase/supabase-js"

import {
  atlasSeederConfig,
} from "./config"

import {
  PaymentReceivedEvent,
} from "./events/payment.events"

import {
  generatePayments,
} from "./generators/payments"

import {
  executeWorkflow,
} from "./workflow/executor"

import {
  loadReturnIdsByClientYear,
} from "./workflow/return-lookup"

async function main(): Promise<void> {
  const supabase =
    createClient(
      atlasSeederConfig.supabaseUrl,
      atlasSeederConfig.publishableKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

  const {
    data: signInData,
    error: signInError,
  } =
    await supabase.auth.signInWithPassword({
      email:
        "admin@atlas.local",

      password:
        atlasSeederConfig.developmentPassword,
    })

  if (signInError) {
    throw new Error(
      `Administrator sign-in failed: ${signInError.message}`,
    )
  }

  if (!signInData.user) {
    throw new Error(
      "Administrator sign-in did not return a user.",
    )
  }

  console.log("")
  console.log(
    `✓ Authenticated as ${signInData.user.email}`,
  )

  const returnIdsByClientYear =
    await loadReturnIdsByClientYear(
      supabase,
    )

  console.log(
    `✓ Loaded ${returnIdsByClientYear.size} tax-return references`,
  )

  const generatedPayments =
    generatePayments()

  const payment =
    generatedPayments[0]

  if (!payment) {
    throw new Error(
      "The Payment Factory did not generate a payment.",
    )
  }

  console.log("")
  console.log(
    "Payment selected for workflow test:",
  )

  console.log(
    [
      `Client ${payment.clientNumber}`,
      `Tax Year ${payment.taxYear}`,
      `$${payment.amount.toFixed(2)}`,
      payment.paymentMethod,
    ].join(" | "),
  )

  console.log("")

  await executeWorkflow(
    supabase,
    signInData.user.id,
    returnIdsByClientYear,
    [
      new PaymentReceivedEvent(
        payment,
      ),
    ],
  )

  console.log("")
  console.log(
    "==============================================",
  )
  console.log(
    " Atlas Payment Workflow Test",
  )
  console.log(
    "==============================================",
  )
  console.log("")

  console.log(
    "✅ Real Atlas payment workflow completed.",
  )

  console.log("")
}

main().catch(
  (error: unknown) => {
    console.error("")
    console.error(
      "❌ Atlas payment workflow test failed.",
    )

    if (
      error instanceof Error
    ) {
      console.error(
        error.message,
      )
    } else {
      console.error(
        error,
      )
    }

    console.error("")

    process.exit(1)
  },
)