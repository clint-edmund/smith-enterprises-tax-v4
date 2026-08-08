export function organizerSearch<T>(
  records: readonly T[],

  search: string,

  selector: (
    record: T,
  ) => readonly string[],
): T[] {
  const normalized =
    search
      .trim()
      .toLowerCase()

  if (!normalized) {
    return [
      ...records,
    ]
  }

  return records.filter(
    (
      record,
    ) =>
      selector(
        record,
      ).some(
        (
          value,
        ) =>
          value
            .toLowerCase()
            .includes(
              normalized,
            ),
      ),
  )
}