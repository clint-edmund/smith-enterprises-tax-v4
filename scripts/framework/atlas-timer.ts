export class AtlasTimer {
  private readonly startedAt =
    performance.now()

  elapsedMilliseconds(): number {
    return (
      performance.now() -
      this.startedAt
    )
  }

  elapsedSeconds(): number {
    return (
      this.elapsedMilliseconds() /
      1000
    )
  }

  formatted(): string {
    return `${this.elapsedSeconds().toFixed(2)} sec`
  }
}