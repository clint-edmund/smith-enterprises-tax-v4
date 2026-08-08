import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import type {
  WorkflowContext,
} from "./types"

export function createWorkflowContext(
  supabase: SupabaseClient,
  administratorId: string,
  returnIdsByClientYear:
    ReadonlyMap<
      string,
      string
    >,
): WorkflowContext {
  return {
    supabase,
    administratorId,
    returnIdsByClientYear,
  }
}