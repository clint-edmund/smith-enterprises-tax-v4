import type {
  AtlasSeedModule,
  AtlasSeederOptions,
} from "./seeder-options"

import {
  atlasSeederProfiles,
  type AtlasSeederProfile,
} from "./seeder-profiles"

const dependencies:
Record<
  AtlasSeedModule,
  readonly AtlasSeedModule[]
> = {
  staff: [],

  clients: [
    "staff",
  ],

  returns: [
    "staff",
    "clients",
  ],

  documents: [
    "staff",
    "clients",
    "returns",
  ],

  workflow: [
    "staff",
    "clients",
    "returns",
  ],

  payments: [
    "staff",
    "clients",
    "returns",
  ],
}

const executionOrder:
readonly AtlasSeedModule[] = [
  "staff",
  "clients",
  "returns",
  "documents",
  "workflow",
  "payments",
]

function addModuleWithDependencies(
  module: AtlasSeedModule,
  plan: Set<AtlasSeedModule>,
): void {
  for (
    const dependency
    of dependencies[module]
  ) {
    addModuleWithDependencies(
      dependency,
      plan,
    )
  }

  plan.add(
    module,
  )
}

export function createModulePlan(
  options: AtlasSeederOptions,
): AtlasSeedModule[] {

  if (options.profile) {
    const profile =
      atlasSeederProfiles[
        options.profile as
          AtlasSeederProfile
      ]

    if (!profile) {
      throw new Error(
        [
          `Unknown Atlas Seeder profile: ${options.profile}`,
          "",
          "Supported profiles:",
          ...Object.keys(
            atlasSeederProfiles,
          ).map(
            (name) =>
              `  ${name}`,
          ),
        ].join("\n"),
      )
    }

    return [
      ...profile.modules,
    ]
  }

  if (options.seedEverything) {
    return [
      ...executionOrder,
    ]
  }

  const plan =
    new Set<AtlasSeedModule>()

  for (
    const module
    of options.modules
  ) {
    addModuleWithDependencies(
      module,
      plan,
    )
  }

  return executionOrder.filter(
    (module) =>
      plan.has(
        module,
      ),
  )
}