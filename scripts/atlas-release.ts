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

import {
  getPackageVersion,
} from "./utils/version"

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
    "Atlas Release Manager",
  )

  const branch =
    getCurrentBranch()

  const version =
    getPackageVersion()

  const releaseTag =
    `v${version}`

  logSection(
    "Release",
  )

  logValue(
    "Version",
    version,
  )

  logValue(
    "Release Tag",
    releaseTag,
  )

  logValue(
    "Current Branch",
    branch,
  )

  logValue(
    "Production Branch",
    atlasConfig.branches.production,
  )

  if (
    branch !==
    atlasConfig.branches.staging
  ) {
    fail(
      `Release preparation must begin from '${atlasConfig.branches.staging}'.`,
    )
  }

  logSuccess(
    "Correct release branch.",
  )

  logSection(
    "Git",
  )

  if (
    !isWorkingTreeClean()
  ) {
    fail(
      "Working tree contains uncommitted changes.",
    )
  }

  logSuccess(
    "Working tree clean.",
  )

  const syncStatus =
    getRemoteSyncStatus()

  logValue(
    "Remote Status",
    syncStatus,
  )

  if (
    syncStatus !==
    "Up to date"
  ) {
    fail(
      [
        "Release branch is not synchronized with GitHub.",
        "",
        `Current status: ${syncStatus}`,
      ].join("\n"),
    )
  }

  logSuccess(
    "Develop is synchronized with GitHub.",
  )

  logSection(
    "Verification",
  )

  const verify =
    runCommand(
      "npm",
      [
        "run",
        "atlas:verify",
      ],
    )

  if (
    !verify.success
  ) {
    console.log(
      verify.output,
    )

    fail(
      "Atlas verification failed.",
    )
  }

  logSuccess(
    "Atlas verification passed.",
  )

  logSection(
    "Release Notes",
  )

  const releaseNotes =
    runCommand(
      "npm",
      [
        "run",
        "atlas:release-notes",
      ],
    )

  if (
    !releaseNotes.success
  ) {
    console.log(
      releaseNotes.output,
    )

    fail(
      "Unable to generate release notes.",
    )
  }

  logSuccess(
    "Release notes generated.",
  )

  /*
   * Release note generation intentionally
   * modifies docs/CHANGELOG.md and creates
   * docs/releases/vX.Y.Z.md.
   */
  if (
    isWorkingTreeClean()
  ) {
    logWarning(
      "Release notes did not create any repository changes.",
    )
  } else {
    logSuccess(
      "Release artifacts are ready for review.",
    )
  }

  logSection(
    "Tag Safety",
  )

  const existingTag =
    runCommand(
      "git",
      [
        "tag",
        "--list",
        releaseTag,
      ],
    )

  if (
    !existingTag.success
  ) {
    fail(
      "Unable to inspect Git tags.",
    )
  }

  if (
    existingTag.output ===
    releaseTag
  ) {
    fail(
      `Release tag ${releaseTag} already exists.`,
    )
  }

  logSuccess(
    `${releaseTag} is available.`,
  )

  logSection(
    "Release Preparation Complete",
  )

  console.log(
    `Review: docs/releases/${releaseTag}.md`,
  )

  console.log(
    "Review: docs/CHANGELOG.md",
  )

  console.log("")

  console.log(
    "Then commit the release artifacts:",
  )

  console.log("")

  console.log(
    `git add docs/CHANGELOG.md docs/releases/${releaseTag}.md`,
  )

  console.log(
    `git commit -m "Prepare Atlas ${releaseTag} release"`,
  )

  console.log(
    "git push origin develop",
  )

  console.log("")

  console.log(
    "Production promotion:",
  )

  console.log(
    "1. Confirm the Vercel develop Preview is approved.",
  )

  console.log(
    "2. Create PR: develop → main.",
  )

  console.log(
    "3. Wait for GitHub Actions to pass.",
  )

  console.log(
    "4. Merge the PR.",
  )

  console.log(
    "5. Confirm Vercel Production is healthy.",
  )

  console.log(
    `6. Tag main with ${releaseTag}.`,
  )

  console.log("")

  logSuccess(
    "Atlas release artifacts prepared.",
  )
}

main()