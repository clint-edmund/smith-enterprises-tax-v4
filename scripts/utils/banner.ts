export function printBanner(
  title: string,
): void {
  const width = 58
  const border =
    "=".repeat(width)

  console.log("")
  console.log(border)
  console.log(
    ` ${title}`,
  )
  console.log(border)
  console.log("")
}