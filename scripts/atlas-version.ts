import {
  readFileSync,
  writeFileSync,
} from "node:fs"

import {
  printBanner,
} from "./utils/banner"

import {
  logFailure,
  logSection,
  logSuccess,
  logValue,
} from "./utils/logger"

type ReleaseType =
  | "patch"
  | "minor"
  | "major"

interface PackageJson {
  name?: string
  version?: string
  scripts?: Record<string, string>
  [key: string]: unknown
}

function fail(
  message: string,
): never {
  logFailure(
    message,
  )

  process.exit(1)
}

function parseVersion(
  version: string,
): [number, number, number] {
  const match =
    /^(\d+)\.(\d+)\.(\d+)$/.exec(
      version,
    )

  if (!match) {
    fail(
      `Invalid semantic version: ${version}`,
    )
  }

  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ]
}

function incrementVersion(
  version: string,
  releaseType: ReleaseType,
): string {
  let [
    major,
    minor,
    patch,
  ] = parseVersion(
    version,
  )

  switch (releaseType) {
    case "patch":
      patch += 1
      break

    case "minor":
      minor += 1
      patch = 0
      break

    case "major":
      major += 1
      minor = 0
      patch = 0
      break
  }

  return [
    major,
    minor,
    patch,
  ].join(".")
}

function main(): void {
  printBanner(
    "Atlas Version Manager",
  )

  const releaseType =
    process.argv[2] as
      | ReleaseType
      | undefined

  if (
    !releaseType ||
    ![
      "patch",
      "minor",
      "major",
    ].includes(
      releaseType,
    )
  ) {
    fail(
      [
        "Release type is required.",
        "",
        "Usage:",
        "npm run atlas:version -- patch",
        "npm run atlas:version -- minor",
        "npm run atlas:version -- major",
      ].join("\n"),
    )
  }

  const packagePath =
    "package.json"

  const packageJson =
    JSON.parse(
      readFileSync(
        packagePath,
        "utf8",
      ),
    ) as PackageJson

  const currentVersion =
    packageJson.version ??
    "0.0.0"

  const nextVersion =
    incrementVersion(
      currentVersion,
      releaseType,
    )

  logSection(
    "Version",
  )

  logValue(
    "Current",
    currentVersion,
  )

  logValue(
    "Release Type",
    releaseType,
  )

  logValue(
    "Next",
    nextVersion,
  )

  packageJson.version =
    nextVersion

  writeFileSync(
    packagePath,
    `${JSON.stringify(
      packageJson,
      null,
      2,
    )}\n`,
  )

  console.log("")

  logSuccess(
    `Atlas version updated to ${nextVersion}.`,
  )

  console.log("")
  console.log(
    "Review package.json before committing.",
  )
}

main()