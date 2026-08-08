import {
  createClient,
} from "@supabase/supabase-js"

import {
  atlasSeederConfig,
} from "./config"

import {
  seedAtlasOffice,
} from "./office-seeder"

import {
  logHeader,
} from "./utils/logger"

import {
  parseSeederOptions,
} from "./config/seeder-options"

import {
  createModulePlan,
} from "./config/module-plan"

const supabase =
  createClient(
    atlasSeederConfig.supabaseUrl,
    atlasSeederConfig.secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

async function main(): Promise<void> {
  logHeader(
    "Atlas Seeder v0.2.0",
  )

  console.log(
    "Environment: LOCAL",
  )

  console.log(
    `Supabase:    ${atlasSeederConfig.supabaseUrl}`,
  )

  console.log("")

  const options =
    parseSeederOptions()

  const modulePlan =
    createModulePlan(
      options,
    )

  console.log(
    `Modules:     ${modulePlan.join(", ")}`,
  )

  console.log("")

  await seedAtlasOffice(
    supabase,
    options,
  )

  console.log(
    "Development password:",
  )

  console.log(
    atlasSeederConfig.developmentPassword,
  )

  console.log("")
}

main().catch(
  (error: unknown) => {
    console.error("")
    console.error(
      "❌ Atlas Seeder failed.",
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