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

import {
  getPackageVersion,
} from "./utils/version"

async function main():
Promise<void> {
  await runAtlasCommand(
    "Atlas Release Manager",
    (atlas) => {
      const context =
        createAtlasContext()

      const version =
        getPackageVersion()

      const releaseTag =
        `v${version}`

      atlas.section(
        "Release",
      )

      atlas.value(
        "Version",
        version,
      )

      atlas.value(
        "Release Tag",
        releaseTag,
      )

      atlas.value(
        "Current Branch",
        context.branch,
      )

      atlas.value(
        "Staging Branch",
        context.stagingBranch,
      )

      atlas.value(
        "Production Branch",
        context.productionBranch,
      )

      if (
        !context.isStagingBranch
      ) {
        failAtlasCommand(
          [
            "Release preparation must begin from the staging branch.",
            "",
            `Switch with: git checkout ${atlasConfig.branches.staging}`,
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
            "Commit or stash all changes before preparing a release.",
          ].join("\n"),
        )
      }

      atlas.pass(
        "Working tree clean",
      )

      atlas.section(
        "Git Synchronization",
      )

      atlas.value(
        "Remote Status",
        context.remoteSyncStatus,
      )

      if (
        context.remoteSyncStatus !==
        "Up to date"
      ) {
        failAtlasCommand(
          [
            "Develop must be fully synchronized with GitHub before release preparation.",
            "",
            `Current status: ${context.remoteSyncStatus}`,
          ].join("\n"),
        )
      }

      atlas.pass(
        "Develop synchronized with GitHub",
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
        failAtlasCommand(
          "Unable to inspect Git tags.",
        )
      }

      if (
        existingTag.output ===
        releaseTag
      ) {
        failAtlasCommand(
          `Release tag ${releaseTag} already exists.`,
        )
      }

      atlas.pass(
        `${releaseTag} is available`,
      )

      atlas.section(
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
        failAtlasCommand(
          [
            "Unable to generate release notes.",
            "",
            releaseNotes.output,
          ].join("\n"),
        )
      }

      atlas.pass(
        "Release notes generated",
      )

      if (
        isReleaseTreeClean()
      ) {
        atlas.warning(
          "No release artifacts changed",
          "CHANGELOG or release notes may already contain this version.",
        )
      } else {
        atlas.pass(
          "Release artifacts ready for review",
        )
      }

      atlas.section(
        "Production Promotion",
      )

      atlas.value(
        "Preview Branch",
        context.stagingBranch,
      )

      atlas.value(
        "Production Branch",
        context.productionBranch,
      )

      console.log("")
      console.log(
        `Review docs/releases/${releaseTag}.md`,
      )

      console.log(
        "Review docs/CHANGELOG.md",
      )

      console.log("")
      console.log(
        "Then:",
      )

      console.log(
        `  git add docs/CHANGELOG.md docs/releases/${releaseTag}.md`,
      )

      console.log(
        `  git commit -m "Prepare Atlas ${releaseTag} release"`,
      )

      console.log(
        `  git push origin ${context.stagingBranch}`,
      )

      console.log("")
      console.log(
        "After customer/QA approval:",
      )

      console.log(
        `  1. Create PR: ${context.stagingBranch} → ${context.productionBranch}`,
      )

      console.log(
        "  2. Wait for GitHub Actions to pass",
      )

      console.log(
        "  3. Merge the PR",
      )

      console.log(
        "  4. Confirm Vercel Production is healthy",
      )

      console.log(
        `  5. Tag main with ${releaseTag}`,
      )

      console.log("")
    },
  )
}

function isReleaseTreeClean():
boolean {
  const status =
    runCommand(
      "git",
      [
        "status",
        "--porcelain",
        "--",
        "docs/CHANGELOG.md",
        "docs/releases",
      ],
    )

  return (
    status.success &&
    status.output === ""
  )
}

void main()