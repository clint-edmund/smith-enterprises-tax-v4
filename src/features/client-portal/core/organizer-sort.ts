export function organizerSort<T>(
  records: readonly T[],

  selector: (
    record: T,
  ) => string | number,

  direction:
    | "asc"
    | "desc" =
      "asc",
): T[] {
  return [
    ...records,
  ].sort(
    (
      left,
      right,
    ) => {
      const a =
        selector(left)

      const b =
        selector(right)

      if (a < b) {
        return direction ===
          "asc"
          ? -1
          : 1
      }

      if (a > b) {
        return direction ===
          "asc"
          ? 1
          : -1
      }

      return 0
    },
  )
}