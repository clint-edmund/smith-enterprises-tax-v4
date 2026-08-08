import {
  readFileSync,
} from "node:fs"

interface PackageJson {
  name?: string
  version?: string
}

export function getPackageVersion():
string {
  try {
    const packageJson =
      JSON.parse(
        readFileSync(
          "package.json",
          "utf8",
        ),
      ) as PackageJson

    return (
      packageJson.version ??
      "unknown"
    )
  } catch {
    return "unknown"
  }
}