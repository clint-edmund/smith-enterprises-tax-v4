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

import {
  getCurrentProfile,
  getCurrentSession,
  signInWithPassword,
  signOutCurrentUser,
} from "@/features/auth/services/auth-service"
import { AuthContext } from "@/features/auth/context/auth-context"
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

  const loadProfile = useCallback(
    async (
      activeSession: Session | null,
    ): Promise<void> => {
      if (!activeSession) {
        setProfile(null)
        return
      }

      const currentProfile =
        await getCurrentProfile()

      setProfile(currentProfile)
    },
    [],
  )

  const refreshProfile =
    useCallback(async (): Promise<void> => {
      if (!session) {
        setProfile(null)
        return
      }

      const currentProfile =
        await getCurrentProfile()

      setProfile(currentProfile)
    }, [session])

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
        setUser(currentSession?.user ?? null)

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
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) {
          return
        }

        setSession(nextSession)
        setUser(nextSession?.user ?? null)

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

      return nextProfile
    } finally {
      setIsLoading(false)
    }
  },
  [],
)

  const signOut = useCallback(
    async (): Promise<void> => {
      setIsLoading(true)

      try {
        await signOutCurrentUser()

        setSession(null)
        setUser(null)
        setProfile(null)
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
      isAuthenticated: session !== null,
      isApproved: profile?.isActive === true,
      signIn,
      signOut,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      isLoading,
      signIn,
      signOut,
      refreshProfile,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}