import { supabase } from "@/services/supabase"

export interface DatabaseHealthResult {
  connected: boolean
  message: string
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  try {
    const { error } = await supabase.auth.getSession()

    if (error) {
      return {
        connected: false,
        message: error.message,
      }
    }

    return {
      connected: true,
      message:
        "Supabase is connected. Authentication is ready for Phase 4.",
    }
  } catch (error) {
    return {
      connected: false,
      message:
        error instanceof Error
          ? error.message
          : "An unknown connection error occurred.",
    }
  }
}