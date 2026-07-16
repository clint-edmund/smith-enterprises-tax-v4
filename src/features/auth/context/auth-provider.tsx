import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  Session,
  User,
} from "@supabase/supabase-js"

import { AuthContext } from "@/features/auth/context/auth-context"
import {
  getCurrentProfile,
  getCurrentSession,
  signInWithPassword,
  signOutCurrentUser,
} from "@/features/auth/services/auth-service"
import {
  acceptCurrentSecurityNotice,
  hasAcceptedCurrentNotice,
  recordSecurityEvent,
} from "@/features/auth/services/security-service"
import type {
  SignInCredentials,
  StaffProfile,
} from "@/features/auth/types/auth.types"
import { supabase } from "@/services/supabase"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null)

  const [user, setUser] =
    useState<User | null>(null)

  const [profile, setProfile] =
    useState<StaffProfile | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    hasAcceptedSecurityNotice,
    setHasAcceptedSecurityNotice,
  ] = useState(false)

  const [
    isCheckingSecurityNotice,
    setIsCheckingSecurityNotice,
  ] = useState(true)

  const loadSecurityNoticeStatus =
    useCallback(
      async (
        activeProfile:
          | StaffProfile
          | null,
      ): Promise<void> => {
        if (!activeProfile?.isActive) {
          setHasAcceptedSecurityNotice(false)
          setIsCheckingSecurityNotice(false)
          return
        }

        setIsCheckingSecurityNotice(true)

        try {
          const result =
            await hasAcceptedCurrentNotice()

          setHasAcceptedSecurityNotice(
            result.accepted,
          )
        } catch (error) {
          console.error(
            "Unable to verify security acknowledgment:",
            error,
          )

          setHasAcceptedSecurityNotice(false)
        } finally {
          setIsCheckingSecurityNotice(false)
        }
      },
      [],
    )

  const loadProfile = useCallback(
    async (
      activeSession: Session | null,
    ): Promise<StaffProfile | null> => {
      if (!activeSession) {
        setProfile(null)
        setHasAcceptedSecurityNotice(false)
        setIsCheckingSecurityNotice(false)

        return null
      }

      const currentProfile =
        await getCurrentProfile()

      setProfile(currentProfile)

      await loadSecurityNoticeStatus(
        currentProfile,
      )

      return currentProfile
    },
    [loadSecurityNoticeStatus],
  )

  const refreshProfile =
    useCallback(async (): Promise<void> => {
      if (!session) {
        setProfile(null)
        return
      }

      await loadProfile(session)
    }, [session, loadProfile])

  const refreshSecurityNotice =
    useCallback(async (): Promise<void> => {
      await loadSecurityNoticeStatus(profile)
    }, [
      loadSecurityNoticeStatus,
      profile,
    ])

  const acceptSecurityNotice =
    useCallback(async (): Promise<void> => {
      await acceptCurrentSecurityNotice()

      setHasAcceptedSecurityNotice(true)
    }, [])

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        const currentSession =
          await getCurrentSession()

        if (!isMounted) {
          return
        }

        setSession(currentSession)
        setUser(
          currentSession?.user ?? null,
        )

        await loadProfile(currentSession)
      } catch (error) {
        console.error(
          "Authentication initialization failed:",
          error,
        )

        if (isMounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setHasAcceptedSecurityNotice(false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsCheckingSecurityNotice(false)
        }
      }
    }

    void initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!isMounted) {
          return
        }

        setSession(nextSession)
        setUser(nextSession?.user ?? null)

        if (event === "SIGNED_IN") {
          window.setTimeout(() => {
            void recordSecurityEvent(
              "staff_signed_in",
              {
                user_agent:
                  navigator.userAgent,
              },
            )
          }, 0)
        }

        window.setTimeout(() => {
          if (!isMounted) {
            return
          }

          void loadProfile(nextSession).catch(
            (error: unknown) => {
              console.error(
                "Unable to load staff profile:",
                error,
              )

              if (isMounted) {
                setProfile(null)
                setHasAcceptedSecurityNotice(
                  false,
                )
              }
            },
          )
        }, 0)
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(
    async (
      credentials: SignInCredentials,
    ): Promise<StaffProfile> => {
      setIsLoading(true)

      try {
        const nextSession =
          await signInWithPassword(credentials)

        setSession(nextSession)
        setUser(nextSession.user)

        const nextProfile =
          await getCurrentProfile()

        if (!nextProfile) {
          throw new Error(
            "No staff profile is associated with this account.",
          )
        }

        setProfile(nextProfile)

        await loadSecurityNoticeStatus(
          nextProfile,
        )

        return nextProfile
      } finally {
        setIsLoading(false)
      }
    },
    [loadSecurityNoticeStatus],
  )

  const signOut = useCallback(
    async (): Promise<void> => {
      setIsLoading(true)

      try {
        await recordSecurityEvent(
          "staff_signed_out",
          {
            user_agent:
              navigator.userAgent,
          },
        )

        await signOutCurrentUser()

        setSession(null)
        setUser(null)
        setProfile(null)
        setHasAcceptedSecurityNotice(false)
        setIsCheckingSecurityNotice(false)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isAuthenticated:
        session !== null,
      isApproved:
        profile?.isActive === true,
      hasAcceptedSecurityNotice,
      isCheckingSecurityNotice,
      signIn,
      signOut,
      refreshProfile,
      acceptSecurityNotice,
      refreshSecurityNotice,
    }),
    [
      session,
      user,
      profile,
      isLoading,
      hasAcceptedSecurityNotice,
      isCheckingSecurityNotice,
      signIn,
      signOut,
      refreshProfile,
      acceptSecurityNotice,
      refreshSecurityNotice,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}