import type {
  LucideIcon,
} from "lucide-react"

import type { AppRole } from "@/features/auth/types/auth.types"

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
  allowedRoles?: AppRole[]
}