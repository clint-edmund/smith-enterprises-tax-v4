export function logSection(
  title: string,
): void {
  console.log("")
  console.log(title)
  console.log(
    "-".repeat(
      Math.max(
        title.length,
        24,
      ),
    ),
  )
}

export function logSuccess(
  message: string,
): void {
  console.log(
    `✓ ${message}`,
  )
}

export function logWarning(
  message: string,
): void {
  console.log(
    `! ${message}`,
  )
}

export function logFailure(
  message: string,
): void {
  console.error(
    `✗ ${message}`,
  )
}

export function logValue(
  label: string,
  value: string,
): void {
  console.log(
    `${label.padEnd(20)} ${value}`,
  )
}