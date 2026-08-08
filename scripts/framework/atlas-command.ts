import {
  AtlasCommandError,
} from "./atlas-errors"

import {
  AtlasTimer,
} from "./atlas-timer"

export type AtlasCheckStatus =
  | "pass"
  | "warning"
  | "fail"

export interface AtlasCheckResult {
  name: string
  status: AtlasCheckStatus
  detail?: string
}

export class AtlasCommand {
  private readonly timer =
    new AtlasTimer()

  private readonly checks:
    AtlasCheckResult[] = []

  constructor(
    private readonly title: string,
  ) {}

  start(): void {
    const border =
      "=".repeat(
        58,
      )

    console.log("")
    console.log(
      border,
    )
    console.log(
      ` ${this.title}`,
    )
    console.log(
      border,
    )
    console.log("")
  }

  section(
    title: string,
  ): void {
    console.log("")
    console.log(
      title,
    )
    console.log(
      "-".repeat(
        Math.max(
          title.length,
          24,
        ),
      ),
    )
  }

  value(
    label: string,
    value: string,
  ): void {
    console.log(
      `${label.padEnd(22)} ${value}`,
    )
  }

  pass(
    name: string,
    detail?: string,
  ): void {
    this.checks.push({
      name,
      status:
        "pass",
      detail,
    })

    console.log(
      `✓ ${name}`,
    )

    if (detail) {
      console.log(
        `  ${detail}`,
      )
    }
  }

  warning(
    name: string,
    detail?: string,
  ): void {
    this.checks.push({
      name,
      status:
        "warning",
      detail,
    })

    console.log(
      `! ${name}`,
    )

    if (detail) {
      console.log(
        `  ${detail}`,
      )
    }
  }

  fail(
    name: string,
    detail?: string,
  ): void {
    this.checks.push({
      name,
      status:
        "fail",
      detail,
    })

    console.error(
      `✗ ${name}`,
    )

    if (detail) {
      console.error(
        `  ${detail}`,
      )
    }
  }

  finish(): void {
    const passed =
      this.checks.filter(
        (check) =>
          check.status ===
          "pass",
      ).length

    const warnings =
      this.checks.filter(
        (check) =>
          check.status ===
          "warning",
      ).length

    const failed =
      this.checks.filter(
        (check) =>
          check.status ===
          "fail",
      ).length

    this.section(
      "Summary",
    )

    this.value(
      "Passed",
      String(
        passed,
      ),
    )

    this.value(
      "Warnings",
      String(
        warnings,
      ),
    )

    this.value(
      "Failed",
      String(
        failed,
      ),
    )

    this.value(
      "Duration",
      this.timer.formatted(),
    )

    console.log("")

    if (failed > 0) {
      console.error(
        "✗ Atlas command completed with failures.",
      )
    } else if (
      warnings > 0
    ) {
      console.log(
        "! Atlas command completed with warnings.",
      )
    } else {
      console.log(
        "✓ Atlas command completed successfully.",
      )
    }

    console.log("")
  }
}

export async function runAtlasCommand(
  title: string,
  operation:
    (
      command: AtlasCommand,
    ) => Promise<void> | void,
): Promise<void> {
  const command =
    new AtlasCommand(
      title,
    )

  command.start()

  try {
    await operation(
      command,
    )

    command.finish()
  } catch (error) {
    if (
      error instanceof
      AtlasCommandError
    ) {
      command.fail(
        error.message,
      )

      command.finish()

      process.exitCode =
        error.exitCode

      return
    }

    command.fail(
      "Unexpected Atlas error",
      error instanceof Error
        ? error.message
        : String(error),
    )

    command.finish()

    process.exitCode = 1
  }
}