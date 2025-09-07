'use client'

import { createContext, useContext } from 'react'
import { useAuthState } from '@/hooks/useAuth'

interface AuthContextType {
  user: any
  isLoading: boolean
  login: (tokens: { access_token: string; refresh_token: string }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuthState()

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
}
