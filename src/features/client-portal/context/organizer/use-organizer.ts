import {
  useContext,
} from "react"

import {
  OrganizerContext,
  type OrganizerContextValue,
} from "@/features/client-portal/context/organizer/organizer-context"

export function useOrganizer():
  OrganizerContextValue {
  const context =
    useContext(
      OrganizerContext,
    )

  if (!context) {
    throw new Error(
      "useOrganizer must be used within an OrganizerProvider.",
    )
  }

  return context
}