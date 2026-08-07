import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  createWorkflowContext,
} from "./context"

import {
  WorkflowEngine,
} from "./engine"

import type {
  WorkflowEvent,
} from "./types"

export async function executeWorkflow(
  supabase: SupabaseClient,
  administratorId: string,
  returnIdsByClientYear:
    ReadonlyMap<
      string,
      string
    >,
  events: readonly WorkflowEvent[],
): Promise<void> {
  const engine =
    new WorkflowEngine(
      createWorkflowContext(
        supabase,
        administratorId,
        returnIdsByClientYear,
      ),
    )

  await engine.run(
    events,
  )
}