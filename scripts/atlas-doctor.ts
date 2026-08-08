import {
  existsSync,
} from "node:fs"

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

interface DoctorCheck {
  name: string
  passed: boolean
  detail: string
  fix?: string
}

function checkCommand(
  name: string,
  command: string,
  args: string[],
  fix?: string,
): DoctorCheck {
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
        ? result.output || "Available"
        : result.output,

    fix,
  }
}

function printDoctorCheck(
  check: DoctorCheck,
): void {
  if (check.passed) {
    logSuccess(
      check.name,
    )

    if (
      check.detail &&
      check.detail !== "Available"
    ) {
      console.log(
        `  ${check.detail}`,
      )
    }

    return
  }

  logFailure(
    check.name,
  )

  if (check.detail) {
    console.log(
      `  Reason: ${check.detail}`,
    )
  }

  if (check.fix) {
    console.log(
      `  Suggested fix: ${check.fix}`,
    )
  }
}

function main(): void {
  printBanner(
    "Atlas Doctor",
  )

  const checks:
    DoctorCheck[] = []

  logSection(
    "Runtime",
  )

  checks.push(
    checkCommand(
      "Node.js",
      "node",
      [
        "--version",
      ],
      "Install or repair Node.js.",
    ),
  )

  checks.push(
    checkCommand(
      "npm",
      "npm",
      [
        "--version",
      ],
      "Install npm with your Node.js installation.",
    ),
  )

  checks.push(
    checkCommand(
      "Supabase CLI",
      "supabase",
      [
        "--version",
      ],
      "Install or repair the Supabase CLI.",
    ),
  )

  for (
    const check
    of checks
  ) {
    printDoctorCheck(
      check,
    )
  }

  logSection(
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
    const exists =
      existsSync(
        file,
      )

    const check:
      DoctorCheck = {
        name:
          file,

        passed:
          exists,

        detail:
          exists
            ? "Found"
            : "Required project file is missing.",

        fix:
          `Restore or recreate ${file}.`,
      }

    checks.push(
      check,
    )

    printDoctorCheck(
      check,
    )
  }

  logSection(
    "Git",
  )

  const branch =
    getCurrentBranch()

  logValue(
    "Current Branch",
    branch,
  )

  const clean =
    isWorkingTreeClean()

  const cleanCheck:
    DoctorCheck = {
      name:
        "Working tree",

      passed:
        clean,

      detail:
        clean
          ? "Clean"
          : "Local changes are present.",

      fix:
        "Run git status, then commit or stash your changes.",
    }

  checks.push(
    cleanCheck,
  )

  printDoctorCheck(
    cleanCheck,
  )

  const remoteStatus =
    getRemoteSyncStatus()

  const remoteCheck:
    DoctorCheck = {
      name:
        "Git remote sync",

      passed:
        remoteStatus ===
        "Up to date",

      detail:
        remoteStatus,

      fix:
        remoteStatus.startsWith(
          "Behind",
        )
          ? `Run git pull origin ${branch}.`
          : remoteStatus.startsWith(
                "Ahead",
              )
            ? `Run git push origin ${branch}.`
            : "Inspect git status and remote branch history.",
    }

  checks.push(
    remoteCheck,
  )

  printDoctorCheck(
    remoteCheck,
  )

  logSection(
    "Supabase Local",
  )

  const supabaseStatus =
    checkCommand(
      "Local Supabase",
      "supabase",
      [
        "status",
      ],
      "Run supabase start.",
    )

  checks.push(
    supabaseStatus,
  )

  printDoctorCheck(
    supabaseStatus,
  )

  logSection(
    "Environment",
  )

  const envExists =
    existsSync(
      ".env.local",
    )

  const envCheck:
    DoctorCheck = {
      name:
        ".env.local",

      passed:
        envExists,

      detail:
        envExists
          ? "Found"
          : "Local environment file is missing.",

      fix:
        "Create .env.local with the required VITE_* and local Atlas development values.",
    }

  checks.push(
    envCheck,
  )

  printDoctorCheck(
    envCheck,
  )

  logSection(
    "Branch Lifecycle",
  )

  if (
    branch ===
    atlasConfig.branches.production
  ) {
    logSuccess(
      "Production branch detected.",
    )
  } else if (
    branch ===
    atlasConfig.branches.staging
  ) {
    logSuccess(
      "Staging branch detected.",
    )
  } else {
    logSuccess(
      "Feature branch detected.",
    )
  }

  logSection(
    "Doctor Summary",
  )

  const failures =
    checks.filter(
      (check) =>
        !check.passed,
    )

  logValue(
    "Checks",
    String(
      checks.length,
    ),
  )

  logValue(
    "Failures",
    String(
      failures.length,
    ),
  )

  console.log("")

  if (
    failures.length === 0
  ) {
    logSuccess(
      "Atlas environment is healthy.",
    )

    return
  }

  logWarning(
    "Atlas Doctor found issues requiring attention.",
  )

  console.log("")

  for (
    const failure
    of failures
  ) {
    console.log(
      `- ${failure.name}`,
    )

    if (failure.fix) {
      console.log(
        `  ${failure.fix}`,
      )
    }
  }

  process.exitCode = 1
}

main()