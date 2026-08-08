import {
  parseSeederOptions,
} from "./config/seeder-options"

import {
  createModulePlan,
} from "./config/module-plan"

const options =
  parseSeederOptions()

const plan =
  createModulePlan(
    options,
  )

console.log("")
console.log(
  "Atlas Seeder Execution Plan",
)
console.log(
  "---------------------------",
)

console.log(
  `Profile: ${options.profile ?? "none"}`,
)

console.log("")

for (const module of plan) {
  console.log(
    `✓ ${module}`,
  )
}

console.log("")