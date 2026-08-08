import type {
  OrganizerHealthLevel,
  OrganizerIssueSeverity,
} from "@/features/client-portal/types/organizer-health.types"

export const organizerHealthMetadata:
  Record<
    OrganizerHealthLevel,
    {
      label: string
      description: string
    }
  > = {
  not_started: {
    label: "Not Started",
    description:
      "No information has been entered for this section.",
  },

  in_progress: {
    label: "In Progress",
    description:
      "This section has been started but is not yet complete.",
  },

  needs_attention: {
    label: "Needs Attention",
    description:
      "This section contains missing or incomplete information.",
  },

  complete: {
    label: "Complete",
    description:
      "This section is complete and ready for review.",
  },
}

export const organizerIssueSeverityMetadata:
  Record<
    OrganizerIssueSeverity,
    {
      label: string
      description: string
    }
  > = {
  information: {
    label: "Information",
    description:
      "Helpful information that does not prevent completion.",
  },

  warning: {
    label: "Warning",
    description:
      "Information should be reviewed before submission.",
  },

  blocking: {
    label: "Action Required",
    description:
      "This issue must be resolved before the organizer can be submitted.",
  },
}