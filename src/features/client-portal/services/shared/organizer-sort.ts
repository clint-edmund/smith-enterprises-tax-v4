export function sortOrganizerRecords<T>(
  records: T[],

  selector: (
    record: T,
  ) => string | number,

  direction:
    "asc" |
    "desc" =
      "asc",
): T[] {
  return [
    ...records,
  ].sort(
    (
      a,
      b,
    ) => {
      const left =
        selector(
          a,
        )

      const right =
        selector(
          b,
        )

      if (
        left <
        right
      ) {
        return direction ===
          "asc"
          ? -1
          : 1
      }

      if (
        left >
        right
      ) {
        return direction ===
          "asc"
          ? 1
          : -1
      }

      return 0
    },
  )
}