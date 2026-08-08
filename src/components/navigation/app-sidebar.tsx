import {
  BriefcaseBusiness,
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

function getInitials(
  profile: StaffProfile,
): string {
  const displayName =
    getStaffName(profile)

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()

  return initials || "SE"
}

export function AppSidebar({
  profile,
  onNavigate,
}: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-inner">
          <img
            src="/smith-enterprises-logo.png"
            alt="Smith Enterprises"
            className="h-auto w-full max-w-56 object-contain"
          />
        </div>

        <div className="mt-4 flex items-start gap-3 px-1">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white">
            <BriefcaseBusiness
              className="size-4"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-white">
              Tax Management System
            </p>

            <p className="mt-1 text-xs text-white/60">
              Version {appConfig.version}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin]">
        <div className="mb-3 flex items-center justify-between px-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Workspace
          </p>

          <ShieldCheck
            className="size-4 text-white/35"
            aria-hidden="true"
          />
        </div>

        <AppNavigation
          role={profile.role}
          onNavigate={onNavigate}
        />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-950 shadow-sm">
              {getInitials(profile)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {getStaffName(profile)}
              </p>

              <p className="mt-0.5 truncate text-xs text-white/55">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-white/10 pt-3">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold capitalize tracking-wide text-white/85">
              {profile.role.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
