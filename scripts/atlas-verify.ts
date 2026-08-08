import {
  createAtlasContext,
} from "./framework/atlas-context"

import {
  runAtlasCommand,
} from "./framework/atlas-command"

import {
  runCommand,
} from "./utils/command"

interface CheckResult {
  success: boolean
  detail: string
}

function executeCheck(
  command: string,
  args: string[],
): CheckResult {
  const result =
    runCommand(
      command,
      args,
    )

  return {
    success:
      result.success,

    detail:
      result.output ||
      (
        result.success
          ? "PASS"
          : "Command failed."
      ),
  }
}

async function main():
Promise<void> {
  await runAtlasCommand(
    "Atlas Verification",
    (atlas) => {
      const context =
        createAtlasContext()

      let hasFailure =
        false

      atlas.section(
        "Git",
      )

      atlas.value(
        "Current Branch",
        context.branch,
      )

      atlas.value(
        "Remote Status",
        context.remoteSyncStatus,
      )

      if (
        context.workingTreeClean
      ) {
        atlas.pass(
          "Working tree clean",
        )
      } else {
        hasFailure =
          true

        atlas.fail(
          "Working tree contains changes",
          "Commit or stash local changes before deployment.",
        )
      }

      if (
        context.remoteSyncStatus ===
        "Up to date"
      ) {
        atlas.pass(
          "Git remote synchronized",
        )
      } else if (
        context.remoteSyncStatus.startsWith(
          "Ahead",
        )
      ) {
        atlas.warning(
          "Local branch is ahead",
          `Push with: git push origin ${context.branch}`,
        )
      } else if (
        context.remoteSyncStatus.startsWith(
          "Behind",
        )
      ) {
        hasFailure =
          true

        atlas.fail(
          "Local branch is behind",
          `Pull with: git pull origin ${context.branch}`,
        )
      } else if (
        context.remoteSyncStatus.startsWith(
          "Diverged",
        )
      ) {
        hasFailure =
          true

        atlas.fail(
          "Git history diverged",
          "Inspect local and remote history before continuing.",
        )
      } else {
        atlas.warning(
          "Unable to confirm Git synchronization",
          context.remoteSyncStatus,
        )
      }

      atlas.section(
        "Application",
      )

      const build =
        executeCheck(
          "npm",
          [
            "run",
            "build",
          ],
        )

      if (
        build.success
      ) {
        atlas.pass(
          "Production build",
        )
      } else {
        hasFailure =
          true

        atlas.fail(
          "Production build",
          build.detail,
        )
      }

      atlas.section(
        "Seeder",
      )

      const options =
        executeCheck(
          "npm",
          [
            "run",
            "dev:seed:test-options",
          ],
        )

      if (
        options.success
      ) {
        atlas.pass(
          "Seeder options",
        )
      } else {
        hasFailure =
          true

        atlas.fail(
          "Seeder options",
          options.detail,
        )
      }

      const returns =
        executeCheck(
          "npm",
          [
            "run",
            "dev:seed:preview-returns",
          ],
        )

      if (
        returns.success
      ) {
        atlas.pass(
          "Return factory",
        )
      } else {
        hasFailure =
          true

        atlas.fail(
          "Return factory",
          returns.detail,
        )
      }

      const payments =
        executeCheck(
          "npm",
          [
            "run",
            "dev:seed:preview-payments",
          ],
        )

      if (
        payments.success
      ) {
        atlas.pass(
          "Payment factory",
        )
      } else {
        hasFailure =
          true

        atlas.fail(
          "Payment factory",
          payments.detail,
        )
      }

      atlas.section(
        "Database",
      )

      const supabase =
        executeCheck(
          "supabase",
          [
            "--version",
          ],
        )

      if (
        supabase.success
      ) {
        atlas.pass(
          "Supabase CLI",
          supabase.detail,
        )
      } else {
        hasFailure =
          true

        atlas.fail(
          "Supabase CLI",
          "Install or repair the Supabase CLI.",
        )
      }

      atlas.section(
        "Deployment Readiness",
      )

      if (
        hasFailure
      ) {
        atlas.fail(
          "Deployment readiness",
          "Resolve failed verification checks before deployment.",
        )

        process.exitCode = 1

        return
      }

      if (
        context.isProductionBranch
      ) {
        atlas.pass(
          "Ready for production release",
        )
      } else if (
        context.isStagingBranch
      ) {
        atlas.pass(
          "Ready for Preview deployment",
        )
      } else {
        atlas.pass(
          "Feature branch ready for Pull Request",
        )
      }
    },
  )
}

void main()