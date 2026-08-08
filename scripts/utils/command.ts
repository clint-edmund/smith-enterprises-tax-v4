import {
  execFileSync,
} from "node:child_process"

export interface CommandResult {
  success: boolean
  output: string
}

export function runCommand(
  command: string,
  args: string[] = [],
): CommandResult {
  try {
    const output =
      execFileSync(
        command,
        args,
        {
          encoding: "utf8",
          stdio: [
            "ignore",
            "pipe",
            "pipe",
          ],
        },
      ).trim()

    return {
      success: true,
      output,
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "stderr" in error
    ) {
      const stderr =
        String(
          error.stderr ?? "",
        ).trim()

      return {
        success: false,
        output:
          stderr ||
          "Command failed.",
      }
    }

    return {
      success: false,
      output:
        "Command failed.",
    }
  }
}