import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  activateLocalPremium,
  fetchMe,
  loginAccount,
  logoutAccount,
  recordServerExport,
  registerAccount,
  type AuthUser,
} from './api'
import type { RegistrationResult } from './contracts/api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<RegistrationResult>
  logout: () => Promise<void>
  recordExport: () => Promise<AuthUser>
  activateLocal: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const result = await fetchMe()
      setUser(result.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refresh,
      login: async (email, password) => {
        const result = await loginAccount(email, password)
        setUser(result.user)
      },
      register: async (email, password, name) => {
        return registerAccount(email, password, name)
      },
      logout: async () => {
        await logoutAccount()
        setUser(null)
      },
      recordExport: async () => {
        const result = await recordServerExport()
        setUser(result.user)
        return result.user
      },
      activateLocal: async () => {
        const result = await activateLocalPremium()
        setUser(result.user)
      },
    }),
    [user, loading, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
