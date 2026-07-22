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
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-inner">
          <img
            src="/smith-enterprises-logo.png"
            alt="Smith Enterprises"
            className="h-auto w-full max-w-56 object-contain"
          />
        </div>

        <div className="mt-4 px-1">
          <p className="text-sm font-semibold tracking-wide text-white">
            Tax Management System
          </p>

          <p className="mt-1 text-xs text-brand-300">
            Version {appConfig.version}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AppNavigation
          role={profile.role}
          onNavigate={onNavigate}
        />
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-sm">
          <p className="truncate text-sm font-semibold text-white">
            {getStaffName(profile)}
          </p>

          <p className="mt-1 truncate text-xs text-brand-300">
            {profile.email}
          </p>

          <p className="mt-3 inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize text-white">
            {profile.role.replaceAll("_", " ")}
          </p>
        </div>
      </div>
    </div>
  )
}
