export function filterOrganizerRecords<T>(
  records: T[],

  search: string,

  selector: (
    record: T,
  ) => string[],
): T[] {
  const normalized =
    search
      .trim()
      .toLowerCase()

  if (!normalized) {
    return records
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