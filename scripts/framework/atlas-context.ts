import {
  atlasConfig,
} from "../../atlas.config"

import {
  getCurrentBranch,
  getRemoteSyncStatus,
  isWorkingTreeClean,
} from "../utils/git"

import {
  getPackageVersion,
} from "../utils/version"

export interface AtlasCommandContext {
  projectName: string
  codename: string
  version: string

  branch: string

  productionBranch: string
  stagingBranch: string

  workingTreeClean: boolean
  remoteSyncStatus: string

  isProductionBranch: boolean
  isStagingBranch: boolean
  isFeatureBranch: boolean
}

export function createAtlasContext():
AtlasCommandContext {
  const branch =
    getCurrentBranch()

  const productionBranch =
    atlasConfig.branches.production

  const stagingBranch =
    atlasConfig.branches.staging

  return {
    projectName:
      atlasConfig.projectName,

    codename:
      atlasConfig.codename,

    version:
      getPackageVersion(),

    branch,

    productionBranch,

    stagingBranch,

    workingTreeClean:
      isWorkingTreeClean(),

    remoteSyncStatus:
      getRemoteSyncStatus(),

    isProductionBranch:
      branch ===
      productionBranch,

    isStagingBranch:
      branch ===
      stagingBranch,

    isFeatureBranch:
      branch !==
        productionBranch &&
      branch !==
        stagingBranch,
  }
}