import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerReviewOverview,
} from "../types"

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
    taxYear < 1900 ||
    taxYear > 2200
  ) {
    throw new Error(
      "A valid tax year is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_staff_organizer_summary",
    {
      requested_client_id:
        normalizedClientId,

      requested_tax_year:
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
      "The organizer review summary was not returned.",
    )
  }

  return data as unknown as
    OrganizerReviewOverview
}
