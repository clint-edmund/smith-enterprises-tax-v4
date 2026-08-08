import {
  runCommand,
} from "./command"

export function getCurrentBranch():
string {
  const result =
    runCommand(
      "git",
      [
        "branch",
        "--show-current",
      ],
    )

  if (!result.success) {
    return "unknown"
  }

  return (
    result.output ||
    "unknown"
  )
}

export function isWorkingTreeClean():
boolean {
  const result =
    runCommand(
      "git",
      [
        "status",
        "--porcelain",
      ],
    )

  return (
    result.success &&
    result.output === ""
  )
}

export function getRemoteSyncStatus():
string {
  const fetch =
    runCommand(
      "git",
      [
        "fetch",
        "--quiet",
        "origin",
      ],
    )

  if (!fetch.success) {
    return "Unable to check"
  }

  const branch =
    getCurrentBranch()

  if (
    branch === "unknown"
  ) {
    return "Unknown"
  }

  const ahead =
    runCommand(
      "git",
      [
        "rev-list",
        "--count",
        `origin/${branch}..${branch}`,
      ],
    )

  const behind =
    runCommand(
      "git",
      [
        "rev-list",
        "--count",
        `${branch}..origin/${branch}`,
      ],
    )

  if (
    !ahead.success ||
    !behind.success
  ) {
    return "Unable to compare"
  }

  const aheadCount =
    Number(
      ahead.output,
    )

  const behindCount =
    Number(
      behind.output,
    )

  if (
    aheadCount === 0 &&
    behindCount === 0
  ) {
    return "Up to date"
  }

  if (
    aheadCount > 0 &&
    behindCount === 0
  ) {
    return `Ahead by ${aheadCount}`
  }

  if (
    aheadCount === 0 &&
    behindCount > 0
  ) {
    return `Behind by ${behindCount}`
  }

  return (
    `Diverged — ahead ${aheadCount}, behind ${behindCount}`
  )
}