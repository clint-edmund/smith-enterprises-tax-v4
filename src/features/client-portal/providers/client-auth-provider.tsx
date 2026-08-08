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

import { supabase } from "@/services/supabase"

import {
  ClientAuthContext,
} from "@/features/client-portal/context/client-auth-context"

import {
  clientSignInWithPassword,
  clientSignOut,
} from "@/features/client-portal/services/client-auth-service"

import {
  getCurrentClientProfile,
  recordClientPortalLogin,
} from "@/features/client-portal/services/client-profile-service"

import type {
  ClientSignInCredentials,
} from "@/features/client-portal/types/client-auth.types"

import type {
  ClientProfile,
} from "@/features/client-portal/types/client-profile.types"

interface ClientAuthProviderProps {
  children: ReactNode
}

export function ClientAuthProvider({
  children,
}: ClientAuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null)

  const [user, setUser] =
    useState<User | null>(null)

  const [profile, setProfile] =
    useState<ClientProfile | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const loadProfile =
    useCallback(
      async (
        activeSession: Session | null,
      ) => {
        if (!activeSession) {
          setProfile(
            null,
          )

          return null
        }

        const currentProfile =
          await getCurrentClientProfile()

        setProfile(
          currentProfile,
        )

        return currentProfile
      },
      [],
    )

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        const {
          data: {
            session: currentSession,
          },
          error,
        } =
          await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!mounted) {
          return
        }

        setSession(
          currentSession,
        )

        setUser(
          currentSession?.user ?? null,
        )

        await loadProfile(
          currentSession,
        )
      } catch (error) {
        console.error(
          "Unable to initialize client authentication.",
          error,
        )

        if (mounted) {
          setSession(
            null,
          )

          setUser(
            null,
          )

          setProfile(
            null,
          )
        }
      } finally {
        if (mounted) {
          setIsLoading(
            false,
          )
        }
      }
    }

    void initialize()

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          nextSession,
        ) => {
          if (!mounted) {
            return
          }

          setSession(
            nextSession,
          )

          setUser(
            nextSession?.user ?? null,
          )

          void loadProfile(
            nextSession,
          ).catch(
            (error: unknown) => {
              console.error(
                "Unable to load the client portal profile.",
                error,
              )

              if (mounted) {
                setProfile(
                  null,
                )
              }
            },
          )
        },
      )

    return () => {
      mounted = false

      subscription.unsubscribe()
    }
  }, [
    loadProfile,
  ])

  const signIn =
    useCallback(
      async (
        credentials:
          ClientSignInCredentials,
      ) => {
        setIsLoading(
          true,
        )

        try {
          const activeSession =
            await clientSignInWithPassword(
              credentials,
            )

          setSession(
            activeSession,
          )

          setUser(
            activeSession.user,
          )

          const currentProfile =
            await getCurrentClientProfile()

          if (!currentProfile) {
            await clientSignOut()

            setSession(
              null,
            )

            setUser(
              null,
            )

            setProfile(
              null,
            )

            throw new Error(
              "No client portal profile exists for this account.",
            )
          }

          if (
            currentProfile.portalStatus !==
            "active"
          ) {
            await clientSignOut()

            setSession(
              null,
            )

            setUser(
              null,
            )

            setProfile(
              null,
            )

            throw new Error(
              "This client portal account is not active.",
            )
          }

          await recordClientPortalLogin()

          const updatedProfile: ClientProfile = {
            ...currentProfile,

            lastLoginAt:
              new Date().toISOString(),
          }

          setProfile(
            updatedProfile,
          )

          return updatedProfile
        } finally {
          setIsLoading(
            false,
          )
        }
      },
      [],
    )

  const signOut =
    useCallback(
      async () => {
        setIsLoading(
          true,
        )

        try {
          await clientSignOut()

          setSession(
            null,
          )

          setUser(
            null,
          )

          setProfile(
            null,
          )
        } finally {
          setIsLoading(
            false,
          )
        }
      },
      [],
    )

  const refreshProfile =
    useCallback(
      async () => {
        await loadProfile(
          session,
        )
      },
      [
        loadProfile,
        session,
      ],
    )

  const value =
    useMemo(
      () => ({
        session,
        user,
        profile,
        isLoading,

        isAuthenticated:
          session !== null &&
          profile !== null &&
          profile.portalStatus ===
            "active",

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
    <ClientAuthContext.Provider
      value={value}
    >
      {children}
    </ClientAuthContext.Provider>
  )
}