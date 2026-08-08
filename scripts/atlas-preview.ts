import {
  atlasConfig,
} from "../atlas.config"

import {
  printBanner,
} from "./utils/banner"

import {
  runCommand,
} from "./utils/command"

import {
  getCurrentBranch,
  getRemoteSyncStatus,
  isWorkingTreeClean,
} from "./utils/git"

import {
  logFailure,
  logSection,
  logSuccess,
  logValue,
  logWarning,
} from "./utils/logger"

function fail(
  message: string,
): never {
  logFailure(
    message,
  )

  process.exit(1)
}

function main(): void {
  printBanner(
    "Atlas Preview Deployment",
  )

  const branch =
    getCurrentBranch()

  logSection(
    "Branch Validation",
  )

  logValue(
    "Current Branch",
    branch,
  )

  logValue(
    "Required Branch",
    atlasConfig.branches.staging,
  )

  if (
    branch !==
    atlasConfig.branches.staging
  ) {
    fail(
      [
        "Preview deployments must originate from the staging branch.",
        "",
        `Switch branches with: git checkout ${atlasConfig.branches.staging}`,
      ].join("\n"),
    )
  }

  logSuccess(
    "Staging branch verified.",
  )

  logSection(
    "Working Tree",
  )

  if (
    !isWorkingTreeClean()
  ) {
    fail(
      [
        "Working tree contains uncommitted changes.",
        "",
        "Run git status and commit or stash the changes before preview deployment.",
      ].join("\n"),
    )
  }

  logSuccess(
    "Working tree clean.",
  )

  logSection(
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
    console.log(
      verification.output,
    )

    fail(
      "Atlas verification failed.",
    )
  }

  logSuccess(
    "Atlas verification passed.",
  )

  logSection(
    "Git Synchronization",
  )

  const syncStatus =
    getRemoteSyncStatus()

  logValue(
    "Remote Status",
    syncStatus,
  )

  if (
    syncStatus.startsWith(
      "Behind",
    ) ||
    syncStatus.startsWith(
      "Diverged",
    )
  ) {
    fail(
      [
        "Local develop is not safely synchronized with GitHub.",
        "",
        `Run git pull origin ${branch} and resolve any differences first.`,
      ].join("\n"),
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
    fail(
      "Unable to verify Git synchronization.",
    )
  }

  if (
    syncStatus.startsWith(
      "Ahead",
    )
  ) {
    logWarning(
      "Local branch contains commits that have not yet been pushed.",
    )
  } else {
    logSuccess(
      "Local branch is synchronized.",
    )
  }

  logSection(
    "Preview Deployment",
  )

  const push =
    runCommand(
      "git",
      [
        "push",
        "origin",
        branch,
      ],
    )

  if (
    !push.success
  ) {
    console.log(
      push.output,
    )

    fail(
      "Unable to push develop to GitHub.",
    )
  }

  logSuccess(
    "Develop pushed to GitHub.",
  )

  console.log("")
  console.log(
    "GitHub Actions will now verify the commit.",
  )

  console.log(
    "Vercel will create or update the Preview deployment automatically.",
  )

  console.log("")

  logSuccess(
    "Atlas Preview deployment initiated.",
  )

  console.log("")
  console.log(
    "Next steps:",
  )

  console.log(
    "  1. Confirm GitHub Actions is green.",
  )

  console.log(
    "  2. Open the develop Preview deployment in Vercel.",
  )

  console.log(
    "  3. Complete the customer demo checklist.",
  )

  console.log(
    "  4. Promote develop to main only after approval.",
  )

  console.log("")
}

main()