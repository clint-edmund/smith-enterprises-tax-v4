export function organizerFilter<T>(
  records: readonly T[],

  predicate: (
    record: T,
  ) => boolean,
): T[] {
  return records.filter(
    predicate,
  )
}

export function organizerMultiFilter<T>(
  records: readonly T[],

  predicates: readonly ((
    record: T,
  ) => boolean)[],
): T[] {
  if (
    predicates.length === 0
  ) {
    return [
      ...records,
    ]
  }

  return records.filter(
    (
      record,
    ) =>
      predicates.every(
        (
          predicate,
        ) =>
          predicate(
            record,
          ),
      ),
  )
}