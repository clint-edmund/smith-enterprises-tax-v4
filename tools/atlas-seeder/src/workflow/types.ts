import type {
  SupabaseClient,
} from "@supabase/supabase-js"

export interface WorkflowEvent {
  readonly name: string

  execute(
    context: WorkflowContext,
  ): Promise<void>
}

export interface WorkflowContext {
  supabase: SupabaseClient

  administratorId: string

  returnIdsByClientYear:
    ReadonlyMap<
      string,
      string
    >
}