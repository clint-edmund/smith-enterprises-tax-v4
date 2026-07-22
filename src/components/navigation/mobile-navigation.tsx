import {
  X,
} from "lucide-react"

import { AppSidebar } from "@/components/navigation/app-sidebar"
import type {
  StaffProfile,
} from "@/features/auth/types/auth.types"

interface MobileNavigationProps {
  isOpen: boolean
  profile: StaffProfile
  onClose: () => void
}

export function MobileNavigation({
  isOpen,
  profile,
  onClose,
}: MobileNavigationProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Application navigation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close navigation menu"
      />

      <aside className="relative h-full w-[min(20rem,90vw)] overflow-hidden border-r border-white/10 bg-sidebar shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/80 shadow-sm transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Close navigation menu"
        >
          <X
            className="size-5"
            aria-hidden="true"
          />
        </button>

        <AppSidebar
          profile={profile}
          onNavigate={onClose}
        />
      </aside>
    </div>
  )
}
