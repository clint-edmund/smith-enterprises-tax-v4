import { atlasConfig } from "../atlas.config"

import { printBanner } from "./utils/banner"
import { runCommand } from "./utils/command"
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
import { getPackageVersion } from "./utils/version"

function fail(message: string): never {
  logFailure(message)
  process.exit(1)
}

function main(): void {
  printBanner("Atlas Release Manager")

  const branch = getCurrentBranch()
  const version = getPackageVersion()

  logSection("Release")

  logValue("Version", version)
  logValue(
    "Production Branch",
    atlasConfig.branches.production,
  )

  logValue(
    "Current Branch",
    branch,
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

  logSection("Git")

  if (!isWorkingTreeClean()) {
    fail(
      "Working tree contains uncommitted changes.",
    )
  }

  logSuccess(
    "Working tree clean.",
  )

  logValue(
    "Remote Status",
    getRemoteSyncStatus(),
  )

  logSection("Verification")

  const verify =
    runCommand(
      "npm",
      [
        "run",
        "atlas:verify",
      ],
    )

  if (!verify.success) {
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

  logSection("Release Checklist")

  console.log(
    "□ Pull Request: develop → main",
  )

  console.log(
    "□ GitHub Actions passed",
  )

  console.log(
    "□ Preview approved",
  )

  console.log(
    "□ Merge PR",
  )

  console.log(
    "□ Confirm Production deployment",
  )

  console.log(
    "□ Create Git tag",
  )

  console.log(
    "□ Update CHANGELOG",
  )

  console.log("")

  logSuccess(
    "Atlas Release is READY.",
  )
}

main()