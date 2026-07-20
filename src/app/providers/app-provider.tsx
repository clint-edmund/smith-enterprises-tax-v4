import type { ReactNode } from "react"

import { AuthProvider } from "@/features/auth/context/auth-provider"

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({
  children,
}: AppProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}