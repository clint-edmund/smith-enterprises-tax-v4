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

interface VerificationCheck {
  name: string
  passed: boolean
  detail: string
}

function runCheck(
  name: string,
  command: string,
  args: string[],
): VerificationCheck {
  const result =
    runCommand(
      command,
      args,
    )

  return {
    name,
    passed:
      result.success,

    detail:
      result.success
        ? "PASS"
        : result.output,
  }
}

function printCheck(
  check: VerificationCheck,
): void {
  if (check.passed) {
    logSuccess(
      `${check.name}: PASS`,
    )

    return
  }

  logFailure(
    `${check.name}: FAIL`,
  )

  console.log(
    check.detail,
  )
}

function main(): void {
  printBanner(
    "Atlas Verification",
  )

  const checks:
    VerificationCheck[] =
      []

  const branch =
    getCurrentBranch()

  const workingTreeClean =
    isWorkingTreeClean()

  const remoteStatus =
    getRemoteSyncStatus()

  logSection(
    "Git",
  )

  logValue(
    "Current Branch",
    branch,
  )

  if (workingTreeClean) {
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

  checks.push({
    name:
      "Git working tree",

    passed:
      workingTreeClean,

    detail:
      workingTreeClean
        ? "PASS"
        : "Commit or stash local changes before deployment.",
  })

  logSection(
    "Application",
  )

  const buildCheck =
    runCheck(
      "Production build",
      "npm",
      [
        "run",
        "build",
      ],
    )

  checks.push(
    buildCheck,
  )

  printCheck(
    buildCheck,
  )

  logSection(
    "Seeder",
  )

  const seederCheck =
    runCheck(
      "Seeder verification",
      "npm",
      [
        "run",
        "dev:seed:test-options",
      ],
    )

  checks.push(
    seederCheck,
  )

  printCheck(
    seederCheck,
  )

  const returnsCheck =
    runCheck(
      "Return factory",
      "npm",
      [
        "run",
        "dev:seed:preview-returns",
      ],
    )

  checks.push(
    returnsCheck,
  )

  printCheck(
    returnsCheck,
  )

  const paymentsCheck =
    runCheck(
      "Payment factory",
      "npm",
      [
        "run",
        "dev:seed:preview-payments",
      ],
    )

  checks.push(
    paymentsCheck,
  )

  printCheck(
    paymentsCheck,
  )

  logSection(
    "Database",
  )

  const supabaseCheck =
    runCheck(
      "Supabase CLI",
      "supabase",
      [
        "--version",
      ],
    )

  checks.push(
    supabaseCheck,
  )

  printCheck(
    supabaseCheck,
  )

  logSection(
    "Verification Summary",
  )

  const passedCount =
    checks.filter(
      (check) =>
        check.passed,
    ).length

  const failedChecks =
    checks.filter(
      (check) =>
        !check.passed,
    )

  logValue(
    "Checks Passed",
    `${passedCount}/${checks.length}`,
  )

  if (
    failedChecks.length > 0
  ) {
    console.log("")

    logFailure(
      "Atlas verification failed.",
    )

    for (
      const check
      of failedChecks
    ) {
      console.log(
        `  - ${check.name}`,
      )
    }

    process.exitCode = 1

    return
  }

  console.log("")

  logSuccess(
    "Atlas verification passed.",
  )

  console.log("")

  if (
    branch ===
    atlasConfig.branches.production
  ) {
    logSuccess(
      "Ready for production release.",
    )
  } else if (
    branch ===
    atlasConfig.branches.staging
  ) {
    logSuccess(
      "Ready for Preview deployment.",
    )
  } else {
    logSuccess(
      "Feature branch is ready for a Pull Request into develop.",
    )
  }
}

main()