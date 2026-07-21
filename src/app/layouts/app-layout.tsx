import {
  useEffect,
  useState,
} from "react"
import {
  Outlet,
  useNavigate,
} from "react-router-dom"

import { AppHeader } from "@/components/navigation/app-header"
import { AppSidebar } from "@/components/navigation/app-sidebar"
import { MobileNavigation } from "@/components/navigation/mobile-navigation"
import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  NotificationSync,
} from "@/features/notifications/components/notification-sync"

export function AppLayout() {
  const navigate = useNavigate()
  

  const {
    profile,
    signOut,
  } = useAuth()

  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  const [isSigningOut, setIsSigningOut] =
    useState(false)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    document.body.style.overflow =
      "hidden"

    window.addEventListener(
      "keydown",
      handleEscape,
    )

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener(
        "keydown",
        handleEscape,
      )
    }
  }, [isMenuOpen])

  if (!profile) {
    return null
  }

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await signOut()

      navigate(
        appConfig.routes.login,
        {
          replace: true,
        },
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <NotificationSync />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <AppSidebar profile={profile} />
      </aside>

      <MobileNavigation
        isOpen={isMenuOpen}
        profile={profile}
        onClose={() => {
          setIsMenuOpen(false)
        }}
      />

      <div className="lg:pl-72">
        <AppHeader
          profile={profile}
          isSigningOut={isSigningOut}
          onOpenMenu={() => {
            setIsMenuOpen(true)
          }}
          onSignOut={() => {
            void handleSignOut()
          }}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}