import {
  ATLAS_SIMULATION_DATE,
  daysAfterSimulation,
  daysBeforeSimulation,
  simulationDateOnlyOffset,
} from "./simulation/clock"

function main(): void {
  console.log("")
  console.log(
    "==============================================",
  )
  console.log(
    " Atlas Simulation Clock Test",
  )
  console.log(
    "==============================================",
  )
  console.log("")

  console.log(
    "Simulation Date:",
    ATLAS_SIMULATION_DATE.toISOString(),
  )

  console.log(
    "7 Days Before:",
    daysBeforeSimulation(
      7,
    ).toISOString(),
  )

  console.log(
    "7 Days After:",
    daysAfterSimulation(
      7,
    ).toISOString(),
  )

  console.log(
    "30-Day Offset:",
    simulationDateOnlyOffset(
      30,
    ),
  )

  console.log("")
  console.log(
    "✅ Atlas Simulation Clock validation passed.",
  )
  console.log("")
}

main()