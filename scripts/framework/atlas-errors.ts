export class AtlasCommandError
extends Error {
  readonly exitCode: number

  constructor(
    message: string,
    exitCode = 1,
  ) {
    super(
      message,
    )

    this.name =
      "AtlasCommandError"

    this.exitCode =
      exitCode
  }
}

export function failAtlasCommand(
  message: string,
  exitCode = 1,
): never {
  throw new AtlasCommandError(
    message,
    exitCode,
  )
}