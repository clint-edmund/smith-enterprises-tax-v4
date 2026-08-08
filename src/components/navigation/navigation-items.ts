import {
  Bell,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileText,
  FolderLock,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import type {
  NavigationItem,
} from "@/components/navigation/navigation.types"
import { appConfig } from "@/config/app-config"
import { permissions } from "@/features/authorization/permissions"

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: appConfig.routes.dashboard,
    icon: LayoutDashboard,
    requiredPermission:
      permissions.dashboard.view,
  },
  {
    label: "Notifications",
    path: appConfig.routes.notifications,
    icon: Bell,
    requiredPermission:
      permissions.notifications.view,
  },
  {
    label: "Clients",
    path: appConfig.routes.clients,
    icon: Users,
    requiredPermission:
      permissions.clients.view,
  },
  {
    label: "Tax Returns",
    path: appConfig.routes.returns,
    icon: FileText,
    requiredPermission:
      permissions.returns.view,
  },
  {
    label: "Documents",
    path: appConfig.routes.documents,
    icon: FolderLock,
    requiredPermission:
      permissions.documents.view,
  },
  {
    label: "Payments",
    path: appConfig.routes.payments,
    icon: CircleDollarSign,
    requiredPermission:
      permissions.payments.view,
  },
  {
    label: "Reports",
    path: appConfig.routes.reports,
    icon: ChartNoAxesCombined,
    requiredPermission:
      permissions.reports.view,
  },
  {
    label: "Settings",
    path: appConfig.routes.settings,
    icon: Settings,
    requiredPermission:
      permissions.settings.view,
  },
]