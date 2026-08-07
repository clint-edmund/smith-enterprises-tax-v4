import {
  ATLAS_DEFAULT_SEED,
  SeededRandom,
} from "./utils/random"

function runTest(): void {
  const first =
    new SeededRandom(
      ATLAS_DEFAULT_SEED,
    )

  const second =
    new SeededRandom(
      ATLAS_DEFAULT_SEED,
    )

  const firstSequence = [
    first.integer(1, 100),
    first.integer(1, 100),
    first.integer(1, 100),
    first.integer(1, 100),
    first.integer(1, 100),
  ]

  const secondSequence = [
    second.integer(1, 100),
    second.integer(1, 100),
    second.integer(1, 100),
    second.integer(1, 100),
    second.integer(1, 100),
  ]

  console.log("")
  console.log(
    "==============================================",
  )
  console.log(
    " Atlas Deterministic Random Test",
  )
  console.log(
    "==============================================",
  )
  console.log("")

  console.log(
    "Seed:",
    ATLAS_DEFAULT_SEED,
  )

  console.log(
    "Run 1:",
    firstSequence,
  )

  console.log(
    "Run 2:",
    secondSequence,
  )

  const matches =
    JSON.stringify(
      firstSequence,
    ) ===
    JSON.stringify(
      secondSequence,
    )

  console.log("")

  if (!matches) {
    console.error(
      "❌ Deterministic random test failed.",
    )

    process.exit(1)
  }

  console.log(
    "✅ Deterministic random test passed.",
  )

  console.log("")
}

runTest()