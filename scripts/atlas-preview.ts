import {
  atlasConfig,
} from "../atlas.config"

import {
  createAtlasContext,
} from "./framework/atlas-context"

import {
  runAtlasCommand,
} from "./framework/atlas-command"

import {
  failAtlasCommand,
} from "./framework/atlas-errors"

import {
  runCommand,
} from "./utils/command"

async function main():
Promise<void> {
  await runAtlasCommand(
    "Atlas Preview Deployment",
    (atlas) => {
      const context =
        createAtlasContext()

      atlas.section(
        "Branch Validation",
      )

      atlas.value(
        "Current Branch",
        context.branch,
      )

      atlas.value(
        "Required Branch",
        atlasConfig.branches.staging,
      )

      if (
        !context.isStagingBranch
      ) {
        failAtlasCommand(
          [
            "Preview deployments must originate from develop.",
            "",
            `Switch branches with: git checkout ${atlasConfig.branches.staging}`,
          ].join("\n"),
        )
      }

      atlas.pass(
        "Staging branch verified",
      )

      atlas.section(
        "Working Tree",
      )

      if (
        !context.workingTreeClean
      ) {
        failAtlasCommand(
          [
            "Working tree contains uncommitted changes.",
            "",
            "Run git status and commit or stash changes before preview deployment.",
          ].join("\n"),
        )
      }

      atlas.pass(
        "Working tree clean",
      )

      atlas.section(
        "Verification",
      )

      const verification =
        runCommand(
          "npm",
          [
            "run",
            "atlas:verify",
          ],
        )

      if (
        !verification.success
      ) {
        failAtlasCommand(
          [
            "Atlas verification failed.",
            "",
            verification.output,
          ].join("\n"),
        )
      }

      atlas.pass(
        "Atlas verification passed",
      )

      atlas.section(
        "Git Synchronization",
      )

      const syncStatus =
        context.remoteSyncStatus

      atlas.value(
        "Remote Status",
        syncStatus,
      )

      if (
        syncStatus.startsWith(
          "Behind",
        )
      ) {
        failAtlasCommand(
          `Run git pull origin ${context.branch} before deploying Preview.`,
        )
      }

      if (
        syncStatus.startsWith(
          "Diverged",
        )
      ) {
        failAtlasCommand(
          "Local and remote develop histories have diverged.",
        )
      }

      if (
        syncStatus ===
          "Unable to check" ||
        syncStatus ===
          "Unable to compare" ||
        syncStatus ===
          "Unknown"
      ) {
        failAtlasCommand(
          "Unable to verify Git synchronization.",
        )
      }

      if (
        syncStatus.startsWith(
          "Ahead",
        )
      ) {
        atlas.warning(
          "Local develop contains unpushed commits",
        )
      } else {
        atlas.pass(
          "Develop synchronized with GitHub",
        )
      }

      atlas.section(
        "Preview Deployment",
      )

      const push =
        runCommand(
          "git",
          [
            "push",
            "origin",
            context.branch,
          ],
        )

      if (
        !push.success
      ) {
        failAtlasCommand(
          [
            "Unable to push develop to GitHub.",
            "",
            push.output,
          ].join("\n"),
        )
      }

      atlas.pass(
        "Develop pushed to GitHub",
      )

      atlas.section(
        "Deployment Lifecycle",
      )

      atlas.value(
        "Git Branch",
        context.branch,
      )

      atlas.value(
        "Vercel",
        "Preview",
      )

      atlas.value(
        "Production Branch",
        context.productionBranch,
      )

      console.log("")
      console.log(
        "GitHub Actions will verify the commit.",
      )

      console.log(
        "Vercel will create/update the Preview deployment automatically.",
      )

      console.log("")

      console.log(
        "Next:",
      )

      console.log(
        "  1. Confirm GitHub Actions is green.",
      )

      console.log(
        "  2. Open the develop Preview deployment.",
      )

      console.log(
        "  3. Complete customer/QA review.",
      )

      console.log(
        "  4. Promote develop → main only after approval.",
      )
    },
  )
}

void main()