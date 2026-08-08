import type {
  WorkflowContext,
  WorkflowEvent,
} from "./types"

export class WorkflowEngine {
  constructor(
    private readonly context: WorkflowContext,
  ) {}

  async run(
    events: readonly WorkflowEvent[],
  ): Promise<void> {
    for (const event of events) {
      console.log(
        `→ ${event.name}`,
      )

      await event.execute(
        this.context,
      )

      console.log(
        `✓ ${event.name}`,
      )
    }
  }
}