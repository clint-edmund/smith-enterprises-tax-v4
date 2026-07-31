import type {
  LucideIcon,
} from "lucide-react"

import type {
  AppRole,
} from "@/features/auth/types/auth.types"

import type {
  Permission,
} from "@/features/authorization/permission-types"

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon

  allowedRoles?: AppRole[]        // temporary during migration
  requiredPermission?: Permission // new
}