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
    <header className="sticky top-0 z-30 border-b border-brand-200/80 bg-white/90 shadow-[0_1px_0_rgb(33_31_28_/_0.04)] backdrop-blur-xl">
      <div className="flex min-h-[4.5rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-brand-300 bg-white text-brand-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu
              className="size-5"
              aria-hidden="true"
            />
          </button>

          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <div className="flex h-10 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-950 px-2.5 shadow-sm">
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

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-950 text-white shadow-sm">
              <ShieldCheck
                className="size-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-brand-950">
                Secure Tax Management
              </p>

              <p className="text-xs text-brand-500">
                Authorized staff workspace
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden border-r border-brand-200 pr-3 text-right sm:block">
            <p className="max-w-52 truncate text-sm font-semibold text-brand-950">
              {getStaffName(profile)}
            </p>

            <p className="mt-0.5 text-xs capitalize text-brand-500">
              {profile.role.replaceAll("_", " ")}
            </p>
          </div>

          <NotificationBell />

          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-brand-300 bg-white px-3 py-2 text-sm font-semibold text-brand-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 disabled:cursor-not-allowed disabled:opacity-50"
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
