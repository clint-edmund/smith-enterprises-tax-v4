import {
  Bell,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import type { NavigationItem } from "@/components/navigation/navigation.types"
import { appConfig } from "@/config/app-config"

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: appConfig.routes.dashboard,
    icon: LayoutDashboard,
  },
  {
  label: "Notifications",
    path: appConfig.routes.notifications,
    icon: Bell,
    allowedRoles: [
      "administrator",
      "manager",
      "preparer",
      "reviewer",
      "receptionist",
      "read_only",
    ],
  },
  {
    label: "Clients",
    path: appConfig.routes.clients,
    icon: Users,
    allowedRoles: [
      "administrator",
      "manager",
      "preparer",
      "reviewer",
      "receptionist",
      "read_only",
    ],
  },
  {
    label: "Tax Returns",
    path: appConfig.routes.returns,
    icon: FileText,
    allowedRoles: [
      "administrator",
      "manager",
      "preparer",
      "reviewer",
      "receptionist",
      "read_only",
    ],
  },
  {
    label: "Payments",
    path: appConfig.routes.payments,
    icon: CircleDollarSign,
    allowedRoles: [
      "administrator",
      "manager",
      "preparer",
      "receptionist",
      "read_only",
    ],
  },
  {
    label: "Reports",
    path: appConfig.routes.reports,
    icon: ChartNoAxesCombined,
    allowedRoles: [
      "administrator",
      "manager",
      "reviewer",
      "read_only",
    ],
  },
  {
    label: "Settings",
    path: appConfig.routes.settings,
    icon: Settings,
    allowedRoles: [
      "administrator",
      "manager",
    ],
  },
]