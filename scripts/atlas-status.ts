import {
  atlasConfig,
} from "../atlas.config"

import {
  printBanner,
} from "./utils/banner"

import {
  getCurrentBranch,
  getRemoteSyncStatus,
  isWorkingTreeClean,
} from "./utils/git"

import {
  logSection,
  logSuccess,
  logValue,
  logWarning,
} from "./utils/logger"

import {
  getPackageVersion,
} from "./utils/version"

function main(): void {
  printBanner(
    "Atlas Engineering Status",
  )

  const branch =
    getCurrentBranch()

  const clean =
    isWorkingTreeClean()

  const remoteStatus =
    getRemoteSyncStatus()

  const version =
    getPackageVersion()

  logSection(
    "Project",
  )

  logValue(
    "Name",
    atlasConfig.projectName,
  )

  logValue(
    "Codename",
    atlasConfig.codename,
  )

  logValue(
    "Version",
    version,
  )

  logSection(
    "Git",
  )

  logValue(
    "Current Branch",
    branch,
  )

  logValue(
    "Production Branch",
    atlasConfig.branches.production,
  )

  logValue(
    "Staging Branch",
    atlasConfig.branches.staging,
  )

  if (clean) {
    logSuccess(
      "Working tree clean",
    )
  } else {
    logWarning(
      "Working tree contains changes",
    )
  }

  logValue(
    "Remote Status",
    remoteStatus,
  )

  logSection(
    "Environment Mapping",
  )

  logValue(
    "Local",
    atlasConfig.environments.local,
  )

  logValue(
    "Preview",
    atlasConfig.environments.preview,
  )

  logValue(
    "Production",
    atlasConfig.environments.production,
  )

  console.log("")
}

main()