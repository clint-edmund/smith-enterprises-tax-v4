import {
  AlertTriangle,
  CalendarCheck2,
  CalendarClock,
  ClipboardCheck,
  FileClock,
  FileSearch,
  Files,
  ShieldCheck,
  UserCheck,
  UserRoundX,
} from "lucide-react"

import type {
  ReportCategoryDefinition,
  ReportDefinition,
} from "@/features/reports/types/report.types"

export const reportCategories: ReportCategoryDefinition[] = [
  {
    id: "operations",
    title: "Operational Reports",
    description:
      "Open live return queues based on workflow status and deadlines.",
  },
  {
    id: "workload",
    title: "Staff Workload Reports",
    description:
      "Review assignments, unassigned work, and personal review queues.",
  },
  {
    id: "management",
    title: "Management Reports",
    description:
      "Use consolidated views for office oversight and follow-up.",
  },
]

export const reports: ReportDefinition[] = [
  {
    id: "all-returns",
    title: "All Tax Returns",
    description:
      "Open the complete return register and refine it with live filters.",
    category: "management",
    href: "/returns",
    icon: Files,
  },
  {
    id: "documents-pending",
    title: "Documents Pending",
    description:
      "Identify returns waiting for client documents or intake information.",
    category: "operations",
    href: "/returns?status=documents_pending",
    icon: FileSearch,
  },
  {
    id: "in-progress",
    title: "Returns in Progress",
    description:
      "Review returns actively being prepared before quality review.",
    category: "operations",
    href: "/returns?status=in_progress",
    icon: FileClock,
  },
  {
    id: "ready-for-review",
    title: "Ready for Review",
    description:
      "Open the quality-review queue for returns marked ready.",
    category: "operations",
    href: "/returns?status=ready_for_review",
    icon: ClipboardCheck,
  },
  {
    id: "overdue",
    title: "Overdue Returns",
    description:
      "Prioritize every return with a due date before today.",
    category: "operations",
    href: "/returns?deadline=overdue",
    icon: AlertTriangle,
    badge: "Priority",
  },
  {
    id: "due-today",
    title: "Due Today",
    description:
      "Display returns whose current due date is today.",
    category: "operations",
    href: "/returns?deadline=due_today",
    icon: CalendarCheck2,
  },
  {
    id: "due-this-week",
    title: "Due This Week",
    description:
      "Review upcoming deadlines through the end of this week.",
    category: "operations",
    href: "/returns?deadline=due_this_week",
    icon: CalendarClock,
  },
  {
    id: "next-seven-days",
    title: "Next Seven Days",
    description:
      "Plan workload for every return due during the next seven days.",
    category: "management",
    href: "/returns?deadline=next_7_days",
    icon: CalendarClock,
  },
  {
    id: "assigned-to-me",
    title: "Assigned to Me",
    description:
      "Open the signed-in staff member's preparation workload.",
    category: "workload",
    href: "/returns?assignment=mine",
    icon: UserCheck,
  },
  {
    id: "review-assigned-to-me",
    title: "My Review Queue",
    description:
      "Open returns assigned to the signed-in staff member for review.",
    category: "workload",
    href: "/returns?reviewer=mine",
    icon: ShieldCheck,
  },
  {
    id: "unassigned-preparer",
    title: "Unassigned Preparation Work",
    description:
      "Find returns that do not yet have an assigned preparer.",
    category: "workload",
    href: "/returns?assignment=unassigned",
    icon: UserRoundX,
    badge: "Manager",
  },
  {
    id: "unassigned-reviewer",
    title: "Unassigned Review Work",
    description:
      "Find returns that do not yet have an assigned reviewer.",
    category: "workload",
    href: "/returns?reviewer=unassigned",
    icon: UserRoundX,
    badge: "Manager",
  },
]
