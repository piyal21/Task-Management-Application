'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { userAPI } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (tokens: { access_token: string; refresh_token: string }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const userData = await userAPI.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to get user data:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    // Fetch user data after login
    userAPI.getCurrentUser()
      .then(setUser)
      .catch(console.error)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return { user, isLoading, login, logout }
}
