import {
  ShieldCheck,
} from "lucide-react"

import { AppNavigation } from "@/components/navigation/app-navigation"
import { appConfig } from "@/config/app-config"
import type {
  StaffProfile,
} from "@/features/auth/types/auth.types"

interface AppSidebarProps {
  profile: StaffProfile
  onNavigate?: () => void
}

function getStaffName(
  profile: StaffProfile,
): string {
  return (
    profile.displayName ||
    [
      profile.firstName,
      profile.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    profile.email
  )
}

export function AppSidebar({
  profile,
  onNavigate,
}: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white">
            <ShieldCheck
              className="size-6"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate font-bold text-slate-950">
              Smith Enterprises
            </p>

            <p className="text-xs text-slate-500">
              Tax Management v{appConfig.version}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AppNavigation
          role={profile.role}
          onNavigate={onNavigate}
        />
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-100 p-3">
          <p className="truncate text-sm font-semibold text-slate-900">
            {getStaffName(profile)}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {profile.email}
          </p>

          <p className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold capitalize text-blue-800">
            {profile.role.replaceAll("_", " ")}
          </p>
        </div>
      </div>
    </div>
  )
}