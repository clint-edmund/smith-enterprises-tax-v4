import type { LucideIcon } from "lucide-react"

export type ReportCategory =
  | "operations"
  | "workload"
  | "management"

export interface ReportDefinition {
  id: string
  title: string
  description: string
  category: ReportCategory
  href: string
  icon: LucideIcon
  badge?: string
}

export interface ReportCategoryDefinition {
  id: ReportCategory
  title: string
  description: string
}
