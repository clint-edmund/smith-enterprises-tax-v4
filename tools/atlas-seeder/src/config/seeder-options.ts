export type AtlasSeedModule =
  | "staff"
  | "clients"
  | "returns"
  | "documents"
  | "workflow"
  | "payments"

export interface AtlasSeederOptions {
  modules: Set<AtlasSeedModule>
  seedEverything: boolean
  profile: string | null
}

const supportedModules:
readonly AtlasSeedModule[] = [
  "staff",
  "clients",
  "returns",
  "documents",
  "workflow",
  "payments",
]

function isAtlasSeedModule(
  value: string,
): value is AtlasSeedModule {
  return supportedModules.includes(
    value as AtlasSeedModule,
  )
}

export function parseSeederOptions(
  args: readonly string[] =
    process.argv.slice(2),
): AtlasSeederOptions {
  const requestedModules =
    new Set<AtlasSeedModule>()

  let profile: string | null =
    null    

  for (const argument of args) {

    if (
      argument.startsWith(
        "--profile=",
      )
    ) {
      profile =
        argument
          .slice(
            "--profile=".length,
          )
          .trim()
          .toLowerCase()

      continue
    }

    if (!argument.startsWith("--")) {
      continue
    }

    const value =
      argument
        .slice(2)
        .trim()
        .toLowerCase()

    if (
      value === "" ||
      value === "all"
    ) {
      continue
    }

    if (
      !isAtlasSeedModule(
        value,
      )
    ) {
      throw new Error(
        [
          `Unsupported Atlas Seeder option: --${value}`,
          "",
          "Supported options:",
          ...supportedModules.map(
            (module) =>
              `  --${module}`,
          ),
          "  --all",
        ].join("\n"),
      )
    }

    requestedModules.add(
      value,
    )
  }

  return {
    modules:
      requestedModules,

    seedEverything:
      requestedModules.size === 0 &&
      profile === null,

    profile,
  }
}

export function shouldRunModule(
  options: AtlasSeederOptions,
  module: AtlasSeedModule,
): boolean {
  return (
    options.seedEverything ||
    options.modules.has(
      module,
    )
  )
}