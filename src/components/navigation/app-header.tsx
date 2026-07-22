import {
  LogOut,
  Menu,
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
    <header className="sticky top-0 z-30 border-b border-brand-200 bg-white/95 shadow-[0_1px_0_rgb(33_31_28_/_0.03)] backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-brand-300 bg-white text-brand-800 transition hover:border-brand-400 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu
              className="size-5"
              aria-hidden="true"
            />
          </button>

          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <div className="flex h-9 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-950 px-2">
              <img
                src="/smith-enterprises-logo.png"
                alt="Smith Enterprises"
                className="h-auto w-full object-contain"
              />
            </div>

            <span className="hidden truncate font-semibold text-brand-950 sm:inline">
              Tax Management
            </span>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-brand-950">
              Secure Tax Management
            </p>

            <p className="text-xs text-brand-500">
              Authorized staff access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-52 truncate text-sm font-semibold text-brand-950">
              {getStaffName(profile)}
            </p>

            <p className="text-xs capitalize text-brand-500">
              {profile.role.replaceAll("_", " ")}
            </p>
          </div>

          <NotificationBell />

          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-3 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-400 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 disabled:cursor-not-allowed disabled:opacity-50"
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
