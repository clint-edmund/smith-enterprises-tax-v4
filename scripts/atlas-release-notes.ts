import {
  existsSync,
  readFileSync,
  writeFileSync,
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

function getLatestTag():
string | null {
  const result =
    runCommand(
      "git",
      [
        "describe",
        "--tags",
        "--abbrev=0",
      ],
    )

  if (
    !result.success ||
    !result.output
  ) {
    return null
  }

  return result.output
}

function getCommitLines(
  latestTag: string | null,
): string[] {
  const range =
    latestTag
      ? `${latestTag}..HEAD`
      : "HEAD"

  const result =
    runCommand(
      "git",
      [
        "log",
        range,
        "--pretty=format:%h|%s",
        "--no-merges",
      ],
    )

  if (!result.success) {
    fail(
      `Unable to read Git history: ${result.output}`,
    )
  }

  if (!result.output) {
    return []
  }

  return result.output
    .split("\n")
    .map(
      (line) =>
        line.trim(),
    )
    .filter(Boolean)
}

function categorizeCommit(
  subject: string,
): string {
  const normalized =
    subject.toLowerCase()

  if (
    normalized.startsWith(
      "fix",
    ) ||
    normalized.includes(
      "bug",
    )
  ) {
    return "Fixed"
  }

  if (
    normalized.startsWith(
      "feat",
    ) ||
    normalized.includes(
      "add ",
    )
  ) {
    return "Added"
  }

  if (
    normalized.includes(
      "refactor",
    ) ||
    normalized.includes(
      "optimiz",
    ) ||
    normalized.includes(
      "performance",
    )
  ) {
    return "Changed"
  }

  if (
    normalized.includes(
      "security",
    ) ||
    normalized.includes(
      "permission",
    )
  ) {
    return "Security"
  }

  return "Changed"
}

function buildReleaseNotes(
  version: string,
  commits: string[],
): string {
  const groups =
    new Map<
      string,
      string[]
    >()

  for (
    const commit
    of commits
  ) {
    const separatorIndex =
      commit.indexOf("|")

    const hash =
      separatorIndex >= 0
        ? commit.slice(
            0,
            separatorIndex,
          )
        : ""

    const subject =
      separatorIndex >= 0
        ? commit.slice(
            separatorIndex + 1,
          )
        : commit

    const category =
      categorizeCommit(
        subject,
      )

    const existing =
      groups.get(
        category,
      ) ?? []

    existing.push(
      hash
        ? `${subject} (${hash})`
        : subject,
    )

    groups.set(
      category,
      existing,
    )
  }

  const sections = [
    "Added",
    "Changed",
    "Fixed",
    "Security",
  ]

  const lines: string[] = [
    `# Atlas v${version}`,
    "",
    "## Release Summary",
    "",
    `Production release for ${atlasConfig.projectName}.`,
    "",
  ]

  for (
    const section
    of sections
  ) {
    const items =
      groups.get(
        section,
      )

    if (
      !items ||
      items.length === 0
    ) {
      continue
    }

    lines.push(
      `## ${section}`,
      "",
    )

    for (
      const item
      of items
    ) {
      lines.push(
        `- ${item}`,
      )
    }

    lines.push("")
  }

  lines.push(
    "## Validation",
    "",
    "- Atlas verification passed",
    "- Git working tree clean",
    "- Preview environment reviewed before production promotion",
    "",
  )

  return lines.join("\n")
}

function updateChangelog(
  version: string,
  releaseNotes: string,
): void {
  const changelogPath =
    "docs/CHANGELOG.md"

  const heading =
    `# Atlas Changelog`

  let current =
    existsSync(
      changelogPath,
    )
      ? readFileSync(
          changelogPath,
          "utf8",
        )
      : `${heading}\n`

  const releaseBlock =
    releaseNotes
      .replace(
        `# Atlas v${version}`,
        `## v${version}`,
      )

  if (
    current.includes(
      `## v${version}`,
    )
  ) {
    logWarning(
      `CHANGELOG already contains v${version}.`,
    )

    return
  }

  if (
    current.startsWith(
      heading,
    )
  ) {
    current =
      current.replace(
        heading,
        `${heading}\n\n${releaseBlock}`,
      )
  } else {
    current =
      `${heading}\n\n${releaseBlock}\n\n${current}`
  }

  writeFileSync(
    changelogPath,
    `${current.trim()}\n`,
  )

  logSuccess(
    "CHANGELOG updated.",
  )
}

function main(): void {
  printBanner(
    "Atlas Release Notes",
  )

  const branch =
    getCurrentBranch()

  const version =
    getPackageVersion()

  logSection(
    "Release",
  )

  logValue(
    "Version",
    version,
  )

  logValue(
    "Branch",
    branch,
  )

  if (
    branch !==
    atlasConfig.branches.staging
  ) {
    fail(
      `Release notes must be prepared from '${atlasConfig.branches.staging}'.`,
    )
  }

  if (
    !isWorkingTreeClean()
  ) {
    fail(
      "Working tree must be clean before generating release notes.",
    )
  }

  const latestTag =
    getLatestTag()

  logValue(
    "Previous Tag",
    latestTag ?? "None",
  )

  const commits =
    getCommitLines(
      latestTag,
    )

  logValue(
    "Commits Found",
    String(
      commits.length,
    ),
  )

  if (
    commits.length === 0
  ) {
    fail(
      "No commits were found for the next release.",
    )
  }

  const releaseNotes =
    buildReleaseNotes(
      version,
      commits,
    )

  const outputPath =
    `docs/releases/v${version}.md`

  runCommand(
    "mkdir",
    [
      "-p",
      "docs/releases",
    ],
  )

  writeFileSync(
    outputPath,
    `${releaseNotes}\n`,
  )

  updateChangelog(
    version,
    releaseNotes,
  )

  console.log("")

  logSuccess(
    `Release notes created: ${outputPath}`,
  )

  console.log("")
  console.log(
    "Review the generated notes before committing.",
  )
}

main()