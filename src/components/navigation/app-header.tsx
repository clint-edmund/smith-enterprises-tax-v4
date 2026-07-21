import {
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react"

import type {
  StaffProfile,
} from "@/features/auth/types/auth.types"

import {
  NotificationBell,
} from "@/features/notifications/components/notification-bell"

interface AppHeaderProps {
  profile: StaffProfile
  isSigningOut: boolean
  onOpenMenu: () => void
  onSignOut: () => void
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

export function AppHeader({
  profile,
  isSigningOut,
  onOpenMenu,
  onSignOut,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu
              className="size-5"
              aria-hidden="true"
            />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <ShieldCheck
              className="size-6 text-blue-700"
              aria-hidden="true"
            />

            <span className="hidden font-bold text-slate-950 sm:inline">
              Smith Enterprises
            </span>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-950">
              Secure Tax Management
            </p>

            <p className="text-xs text-slate-500">
              Authorized staff access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-52 truncate text-sm font-semibold text-slate-950">
              {getStaffName(profile)}
            </p>

            <p className="text-xs capitalize text-slate-500">
              {profile.role.replaceAll("_", " ")}
            </p>
          </div>

          <NotificationBell />

          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut
              className="size-4"
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              {isSigningOut
                ? "Signing Out..."
                : "Sign Out"}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}