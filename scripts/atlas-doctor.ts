import {
  existsSync,
} from "node:fs"

import {
  createAtlasContext,
} from "./framework/atlas-context"

import {
  runAtlasCommand,
} from "./framework/atlas-command"

import {
  runCommand,
} from "./utils/command"

interface DoctorResult {
  success: boolean
  detail: string
}

function checkCommand(
  command: string,
  args: string[],
): DoctorResult {
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
          ? "Available"
          : "Command failed."
      ),
  }
}

async function main():
Promise<void> {
  await runAtlasCommand(
    "Atlas Doctor",
    (atlas) => {
      const context =
        createAtlasContext()

      atlas.section(
        "Runtime",
      )

      const node =
        checkCommand(
          "node",
          [
            "--version",
          ],
        )

      if (node.success) {
        atlas.pass(
          "Node.js",
          node.detail,
        )
      } else {
        atlas.fail(
          "Node.js",
          "Install or repair Node.js.",
        )
      }

      const npm =
        checkCommand(
          "npm",
          [
            "--version",
          ],
        )

      if (npm.success) {
        atlas.pass(
          "npm",
          npm.detail,
        )
      } else {
        atlas.fail(
          "npm",
          "Install npm with Node.js.",
        )
      }

      const supabase =
        checkCommand(
          "supabase",
          [
            "--version",
          ],
        )

      if (supabase.success) {
        atlas.pass(
          "Supabase CLI",
          supabase.detail,
        )
      } else {
        atlas.fail(
          "Supabase CLI",
          "Install or repair the Supabase CLI.",
        )
      }

      atlas.section(
        "Project Files",
      )

      const requiredFiles = [
        "package.json",
        "atlas.config.ts",
        "vite.config.ts",
        "supabase/config.toml",
        "scripts/verify-project.sh",
      ]

      for (
        const file
        of requiredFiles
      ) {
        if (
          existsSync(
            file,
          )
        ) {
          atlas.pass(
            file,
          )
        } else {
          atlas.fail(
            file,
            `Restore or recreate ${file}.`,
          )
        }
      }

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
        atlas.warning(
          "Working tree contains changes",
          "Run git status and commit or stash your changes.",
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
          `Run git push origin ${context.branch}.`,
        )
      } else if (
        context.remoteSyncStatus.startsWith(
          "Behind",
        )
      ) {
        atlas.fail(
          "Local branch is behind",
          `Run git pull origin ${context.branch}.`,
        )
      } else if (
        context.remoteSyncStatus.startsWith(
          "Diverged",
        )
      ) {
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
        "Supabase Local",
      )

      const localSupabase =
        checkCommand(
          "supabase",
          [
            "status",
          ],
        )

      if (
        localSupabase.success
      ) {
        atlas.pass(
          "Local Supabase running",
        )
      } else {
        atlas.warning(
          "Local Supabase is not running",
          "Run: supabase start",
        )
      }

      atlas.section(
        "Environment",
      )

      if (
        existsSync(
          ".env.local",
        )
      ) {
        atlas.pass(
          ".env.local found",
        )
      } else {
        atlas.fail(
          ".env.local missing",
          "Create .env.local with the required local environment variables.",
        )
      }

      atlas.section(
        "Branch Lifecycle",
      )

      atlas.value(
        "Production",
        context.productionBranch,
      )

      atlas.value(
        "Staging",
        context.stagingBranch,
      )

      if (
        context.isProductionBranch
      ) {
        atlas.pass(
          "Production branch detected",
        )
      } else if (
        context.isStagingBranch
      ) {
        atlas.pass(
          "Staging branch detected",
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