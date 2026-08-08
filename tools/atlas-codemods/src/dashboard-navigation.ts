import {
  readFile,
  writeFile,
} from "node:fs/promises"

import {
  relative,
} from "node:path"

import type {
  CodemodDefinition,
  CodemodResult,
} from "./types/codemod.types"

import {
  findTypeScriptFiles,
} from "./utils/file-walker"

const dashboardRoot =
  "src/features/dashboard"

const navigationImport = `import {
  getReturnsRoute,
} from "@/features/returns/utils/return-navigation"`

type StaticFilterValue =
  | string
  | undefined

function buildFilterObject(
  url: string,
): string {
  const questionMark =
    url.indexOf("?")

  if (
    questionMark === -1
  ) {
    return "{}"
  }

  const query =
    url.slice(
      questionMark + 1,
    )

  const params =
    new URLSearchParams(
      query,
    )

  const entries:
    string[] = []

  const search =
    params.get(
      "search",
    )

  const status =
    params.get(
      "status",
    )

  const workflow =
    params.get(
      "workflow",
    )

  const taxYear =
    params.get(
      "taxYear",
    )

  const preparer =
    params.get(
      "preparer",
    )

  const assignment =
    params.get(
      "assignment",
    )

  const reviewer =
    params.get(
      "reviewer",
    )

  const deadline =
    params.get(
      "deadline",
    )

  const completedPeriod =
    params.get(
      "completedPeriod",
    )

  function add(
    key: string,
    value: StaticFilterValue,
  ): void {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "all"
    ) {
      return
    }

    entries.push(
      `${key}: ${JSON.stringify(value)},`,
    )
  }

  add(
    "search",
    search ?? undefined,
  )

  add(
    "status",
    status ?? undefined,
  )

  add(
    "workflow",
    workflow ?? undefined,
  )

  add(
    "taxYear",
    taxYear ?? undefined,
  )

  add(
    "preparerId",
    preparer ?? undefined,
  )

  add(
    "assignment",
    assignment ?? undefined,
  )

  add(
    "reviewer",
    reviewer ?? undefined,
  )

  add(
    "deadline",
    deadline ?? undefined,
  )

  add(
    "completedPeriod",
    completedPeriod ?? undefined,
  )

  if (
    entries.length === 0
  ) {
    return "{}"
  }

  return [
    "{",
    ...entries.map(
      (entry) =>
        `  ${entry}`,
    ),
    "}",
  ].join("\n")
}

function ensureNavigationImport(
  content: string,
): {
  content: string
  added: boolean
} {
  if (
    content.includes(
      "@/features/returns/utils/return-navigation",
    )
  ) {
    return {
      content,
      added: false,
    }
  }

  const importMatches =
    [
      ...content.matchAll(
        /^import[\s\S]*?from\s+["'][^"']+["']\s*$/gm,
      ),
    ]

  if (
    importMatches.length === 0
  ) {
    return {
      content:
        `${navigationImport}\n\n${content}`,

      added: true,
    }
  }

  const lastImport =
    importMatches[
      importMatches.length - 1
    ]

  const insertionPoint =
    (
      lastImport.index ??
      0
    ) +
    lastImport[0].length

  return {
    content:
      content.slice(
        0,
        insertionPoint,
      ) +
      "\n" +
      navigationImport +
      content.slice(
        insertionPoint,
      ),

    added: true,
  }
}

function transformStaticRoutes(
  content: string,
): {
  content: string
  changes: number
} {
  let changes = 0

  /*
   * Object properties such as:
   *
   * href: "/returns?workflow=review",
   */
  content =
    content.replace(
      /href:\s*["'](\/returns\?[^"']+)["']/g,
      (
        _match,
        url: string,
      ) => {
        changes += 1

        const filters =
          buildFilterObject(
            url,
          )

        if (
          filters === "{}"
        ) {
          return "href: getReturnsRoute()"
        }

        return `href: getReturnsRoute(${filters})`
      },
    )

  /*
   * JSX attributes such as:
   *
   * to="/returns?assignment=unassigned"
   * href="/returns?status=in_progress"
   */
  content =
    content.replace(
      /(to|href)=["'](\/returns\?[^"']+)["']/g,
      (
        _match,
        attribute:
          "to" | "href",
        url: string,
      ) => {
        changes += 1

        const filters =
          buildFilterObject(
            url,
          )

        if (
          filters === "{}"
        ) {
          return `${attribute}={getReturnsRoute()}`
        }

        return `${attribute}={getReturnsRoute(${filters})}`
      },
    )

  return {
    content,
    changes,
  }
}

function transformDynamicRoutes(
  content: string,
): {
  content: string
  changes: number
} {
  let changes = 0

  /*
   * Dashboard status chart.
   *
   * `/returns?status=${encodeURIComponent(item.status)}`
   */
  const statusPatterns = [
    /`\/returns\?status=\$\{encodeURIComponent\(item\.status\)\}`/g,
    /`\/returns\?status=\$\{item\.status\}`/g,
  ]

  for (
    const pattern
    of statusPatterns
  ) {
    content =
      content.replace(
        pattern,
        () => {
          changes += 1

          return [
            "getReturnsRoute({",
            "  status: item.status,",
            "})",
          ].join("\n")
        },
      )
  }

  /*
    * Staff workload with workflow filter.
    *
    * `/returns?preparer=${item.staffId}&workflow=in_preparation`
    * `/returns?preparer=${item.staffId}&workflow=review`
    */
    content =
    content.replace(
        /`\/returns\?preparer=\$\{item\.staffId\}&workflow=([a-z_]+)`/g,
        (
        _match,
        workflow: string,
        ) => {
        changes += 1

        return [
            "getReturnsRoute({",
            "  preparerId: item.staffId,",
            `  workflow: ${JSON.stringify(workflow)},`,
            "})",
        ].join("\n")
        },
    )

  /*
   * Staff workload.
   *
   * `/returns?preparer=${item.staffId}`
   */
  content =
    content.replace(
      /`\/returns\?preparer=\$\{item\.staffId\}`/g,
      () => {
        changes += 1

        return [
          "getReturnsRoute({",
          "  preparerId: item.staffId,",
          "})",
        ].join("\n")
      },
    )

  return {
    content,
    changes,
  }
}

function countRemainingHardcodedRoutes(
  content: string,
): number {
  const staticMatches =
    content.match(
      /\/returns\?[^"'`\s}]*/g,
    ) ?? []

  const templateMatches =
    content.match(
      /`\/returns\?[^`]+`/g,
    ) ?? []

  return (
    staticMatches.length +
    templateMatches.length
  )
}

export const dashboardNavigationCodemod:
CodemodDefinition = {
  name:
    "dashboard-navigation",

  description:
    "Convert hardcoded dashboard Returns URLs to typed navigation helpers.",

  async run(
    options,
  ): Promise<CodemodResult> {
    const files =
      await findTypeScriptFiles(
        dashboardRoot,
      )

    const affectedFiles:
      CodemodResult["files"] = []

    let totalChanges = 0

    for (
      const file
      of files
    ) {
      const original =
        await readFile(
          file,
          "utf8",
        )

      const staticResult =
        transformStaticRoutes(
          original,
        )

      const dynamicResult =
        transformDynamicRoutes(
          staticResult.content,
        )

      const fileChanges =
        staticResult.changes +
        dynamicResult.changes

      if (
        fileChanges === 0
      ) {
        continue
      }

      const importResult =
        ensureNavigationImport(
          dynamicResult.content,
        )

      const displayPath =
        relative(
          process.cwd(),
          file,
        )

      affectedFiles.push({
        path:
          displayPath,

        changes:
          fileChanges,
      })

      totalChanges +=
        fileChanges

      console.log(
        `  ${displayPath}`,
      )

      console.log(
        `    routes: ${fileChanges}`,
      )

      if (
        importResult.added
      ) {
        console.log(
          "    import: added",
        )
      }

      const remaining =
        countRemainingHardcodedRoutes(
          importResult.content,
        )

      if (
        remaining > 0
      ) {
        console.log(
          `    warning: ${remaining} hardcoded route pattern(s) remain`,
        )
      }

      if (
        options.mode ===
        "write"
      ) {
        await writeFile(
          file,
          importResult.content,
          "utf8",
        )
      }
    }

    return {
      name:
        "dashboard-navigation",

      filesScanned:
        files.length,

      filesModified:
        affectedFiles.length,

      changes:
        totalChanges,

      files:
        affectedFiles,
    }
  },
}