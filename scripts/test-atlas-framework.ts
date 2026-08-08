import {
  createAtlasContext,
} from "./framework/atlas-context"

import {
  runAtlasCommand,
} from "./framework/atlas-command"

async function main():
Promise<void> {
  await runAtlasCommand(
    "Atlas Framework Test",
    (atlas) => {
      const context =
        createAtlasContext()

      atlas.section(
        "Project",
      )

      atlas.value(
        "Project",
        context.projectName,
      )

      atlas.value(
        "Version",
        context.version,
      )

      atlas.section(
        "Git",
      )

      atlas.value(
        "Branch",
        context.branch,
      )

      atlas.value(
        "Remote",
        context.remoteSyncStatus,
      )

      if (
        context.workingTreeClean
      ) {
        atlas.pass(
          "Working tree clean",
        )
      } else {
        atlas.warning(
          "Working tree contains changes",
        )
      }

      if (
        context.isStagingBranch
      ) {
        atlas.pass(
          "Develop branch detected",
        )
      } else if (
        context.isProductionBranch
      ) {
        atlas.pass(
          "Production branch detected",
        )
      } else {
        atlas.pass(
          "Feature branch detected",
        )
      }
    },
  )
}

void main()