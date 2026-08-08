export class Stopwatch {
  private readonly startedAt =
    performance.now()

  elapsedMilliseconds(): number {
    return (
      performance.now() -
      this.startedAt
    )
  }

  elapsedSeconds(): string {
    return (
      this.elapsedMilliseconds() /
      1000
    ).toFixed(2)
  }
}