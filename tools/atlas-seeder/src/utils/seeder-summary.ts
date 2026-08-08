import type {
  ModuleResult,
} from "../models/module-result"

export function printSeederSummary(
  results: ModuleResult[],
): void {
  console.log("")
  console.log(
    "========================================================",
  )
  console.log(
    " Atlas Development Seeder Summary",
  )
  console.log(
    "========================================================",
  )

  let totalSeconds = 0

  for (
    const result
    of results
  ) {
    totalSeconds +=
      result.elapsedSeconds

    console.log(
      `${result.name.padEnd(24)} ${String(result.count).padStart(6)}   ${result.elapsedSeconds.toFixed(2)} sec`,
    )
  }

  console.log(
    "--------------------------------------------------------",
  )

  console.log(
    `Total Runtime`.padEnd(24),
    `${totalSeconds.toFixed(2)} sec`,
  )

  console.log("")
  console.log(
    "✓ Atlas development environment ready.",
  )
}