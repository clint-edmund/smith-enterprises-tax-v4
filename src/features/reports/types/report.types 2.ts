import type { LucideIcon } from "lucide-react"

export type ReportCategory =
  | "operations"
  | "workload"
  | "management"

export type ReportScheduleCadence =
  | "daily"
  | "weekly"
  | "monthly"

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

export interface SavedReportPreference {
  reportId: string
  isFavorite: boolean
  schedule?: {
    cadence: ReportScheduleCadence
    dayOfWeek?: number
    dayOfMonth?: number
    hour: number
  }
}
