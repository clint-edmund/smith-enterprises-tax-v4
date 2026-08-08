export class SeededRandom {
  private state: number

  constructor(seed: number) {
    if (!Number.isInteger(seed)) {
      throw new Error(
        "SeededRandom requires an integer seed.",
      )
    }

    this.state = seed >>> 0
  }

  /**
   * Returns a deterministic floating-point number
   * between 0 inclusive and 1 exclusive.
   */
  next(): number {
    this.state += 0x6d2b79f5

    let value = this.state

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1,
    )

    value ^= value + Math.imul(
      value ^ (value >>> 7),
      value | 61,
    )

    return (
      (
        value ^
        (value >>> 14)
      ) >>> 0
    ) / 4294967296
  }

  /**
   * Integer between min and max, inclusive.
   */
  integer(
    min: number,
    max: number,
  ): number {
    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max)
    ) {
      throw new Error(
        "integer() requires integer bounds.",
      )
    }

    if (max < min) {
      throw new Error(
        "integer() max must be greater than or equal to min.",
      )
    }

    return Math.floor(
      this.next() * (max - min + 1),
    ) + min
  }

  /**
   * Returns true according to the requested probability.
   *
   * Example:
   * chance(0.25) = approximately 25% true.
   */
  chance(
    probability: number,
  ): boolean {
    if (
      probability < 0 ||
      probability > 1
    ) {
      throw new Error(
        "chance() probability must be between 0 and 1.",
      )
    }

    return this.next() < probability
  }

  /**
   * Select one item from an array.
   */
  pick<T>(
    values: readonly T[],
  ): T {
    if (values.length === 0) {
      throw new Error(
        "pick() cannot select from an empty array.",
      )
    }

    return values[
      this.integer(
        0,
        values.length - 1,
      )
    ]
  }

  /**
   * Returns a shuffled copy without changing
   * the original array.
   */
  shuffle<T>(
    values: readonly T[],
  ): T[] {
    const result = [...values]

    for (
      let index = result.length - 1;
      index > 0;
      index -= 1
    ) {
      const swapIndex =
        this.integer(
          0,
          index,
        )

      const current =
        result[index]

      result[index] =
        result[swapIndex]

      result[swapIndex] =
        current
    }

    return result
  }

  /**
   * Select N unique values.
   */
  sample<T>(
    values: readonly T[],
    count: number,
  ): T[] {
    if (
      count < 0 ||
      count > values.length
    ) {
      throw new Error(
        "sample() count is outside the valid range.",
      )
    }

    return this.shuffle(
      values,
    ).slice(
      0,
      count,
    )
  }

  /**
   * Decimal number rounded to the requested precision.
   */
  decimal(
    min: number,
    max: number,
    precision = 2,
  ): number {
    if (max < min) {
      throw new Error(
        "decimal() max must be greater than or equal to min.",
      )
    }

    const value =
      min +
      this.next() *
        (max - min)

    const multiplier =
      10 ** precision

    return (
      Math.round(
        value * multiplier,
      ) / multiplier
    )
  }

  /**
   * Creates deterministic dates between two endpoints.
   */
  dateBetween(
    start: Date,
    end: Date,
  ): Date {
    const startTime =
      start.getTime()

    const endTime =
      end.getTime()

    if (endTime < startTime) {
      throw new Error(
        "dateBetween() end date must not precede start date.",
      )
    }

    const timestamp =
      startTime +
      this.next() *
        (
          endTime -
          startTime
        )

    return new Date(
      Math.floor(timestamp),
    )
  }
}

export const ATLAS_DEFAULT_SEED =
  20260807

export const atlasRandom =
  new SeededRandom(
    ATLAS_DEFAULT_SEED,
  )