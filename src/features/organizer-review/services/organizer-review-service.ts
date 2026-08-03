import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerReviewOverview,
} from "../types"

interface TemporaryRpcResponse {
  data: unknown

  error:
    | {
        message: string
      }
    | null
}

type TemporaryRpcFunction = (
  functionName: string,

  args: Record<
    string,
    unknown
  >,
) => Promise<TemporaryRpcResponse>

export async function getOrganizerReviewOverview(
  clientId: string,
  taxYear: number,
): Promise<OrganizerReviewOverview> {
  const normalizedClientId =
    clientId.trim()

  if (!normalizedClientId) {
    throw new Error(
      "A client identifier is required.",
    )
  }

  if (
    !Number.isInteger(
      taxYear,
    ) ||
    taxYear < 1900
  ) {
    throw new Error(
      "A valid tax year is required.",
    )
  }

  const temporaryRpc =
    supabase.rpc as unknown as
      TemporaryRpcFunction

  const {
    data,
    error,
  } = await temporaryRpc(
    "get_staff_organizer_review_overview",
    {
      p_client_id:
        normalizedClientId,

      p_tax_year:
        taxYear,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (!data) {
    throw new Error(
      "The organizer review overview was not returned.",
    )
  }

  return data as
    OrganizerReviewOverview
}