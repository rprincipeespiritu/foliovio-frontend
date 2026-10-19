import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  activateLocalPremium,
  fetchMe,
  loginAccount,
  logoutAccount,
  recordServerExport,
  registerAccount,
  reportActivity,
  ApiError,
  type SessionInfo,
  type AuthUser,
} from './api'
import type { RegistrationResult } from './contracts/api'
import { IdleSession } from './idle-session'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  sessionNotice: string | null
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
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [sessionNotice, setSessionNotice] = useState<string | null>(null)
  const sessionRef = useRef<SessionInfo | null>(null)
  const generation = useRef(0)

  const endSession = useCallback((id: string, expired: boolean) => {
    if (sessionRef.current?.id !== id) return
    generation.current++
    sessionRef.current = null
    setSession(null)
    setUser(null)
    setLoading(false)
    setSessionNotice(expired ? 'Tu sesión caducó tras 10 minutos sin actividad. Vuelve a entrar para continuar. Tu currículum sigue guardado en este navegador.' : null)
    try { localStorage.setItem(`foliovio:session:${id}`, JSON.stringify({ ended: true, expired })) } catch { /* Storage can be disabled. */ }
  }, [])

  const acceptSession = useCallback((nextUser: AuthUser | null, nextSession: SessionInfo | null) => {
    if (!nextUser || !nextSession) {
      const current = sessionRef.current
      if (current) endSession(current.id, true)
      else setUser(null)
      return
    }
    setUser(nextUser)
    // Refreshing profile/subscription data must not reset the idle clock.
    if (sessionRef.current?.id !== nextSession.id) {
      sessionRef.current = nextSession
      setSession(nextSession)
    }
    setSessionNotice(null)
  }, [endSession])

  const refresh = useCallback(async () => {
    const version = generation.current
    try {
      const result = await fetchMe()
      if (version === generation.current) acceptSession(result.user, result.session)
    } catch {
      // A transient network failure does not restart or discard the idle clock.
    } finally {
      setLoading(false)
    }
  }, [acceptSession])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!session) return
    const id = session.id
    const key = `foliovio:session:${id}`
    let disposed = false
    const expire = () => {
      if (disposed || sessionRef.current?.id !== id) return
      endSession(id, true)
      void logoutAccount(id).catch(() => { /* The server also enforces the deadline. */ })
    }
    const idle = new IdleSession(session.remainingMs, Date.now, {
      expire,
      publish: at => {
        try { localStorage.setItem(key, JSON.stringify({ at })) } catch { /* In-memory expiry still works. */ }
      },
      report: idleMs => {
        void reportActivity(id, idleMs).catch(error => {
          if (error instanceof ApiError && error.status === 401) expire()
        })
      },
    })
    const readShared = (raw: string | null) => {
      try {
        const value = JSON.parse(raw || 'null')
        if (value?.ended) endSession(id, value.expired === true)
        else if (typeof value?.at === 'number') idle.receive(value.at)
      } catch { /* Ignore malformed or unavailable storage. */ }
    }
    const check = () => {
      try { readShared(localStorage.getItem(key)) } catch { /* Storage can be disabled. */ }
      if (sessionRef.current?.id === id) idle.tick()
    }
    const onActivity = (event: Event) => {
      if (!event.isTrusted || document.visibilityState !== 'visible') return
      check()
      if (sessionRef.current?.id === id) idle.activity()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) readShared(event.newValue)
    }
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']
    events.forEach(event => window.addEventListener(event, onActivity, { passive: true, capture: true }))
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    const timer = window.setInterval(check, 1000)
    check()
    return () => {
      disposed = true
      clearInterval(timer)
      events.forEach(event => window.removeEventListener(event, onActivity, true))
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [session, endSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      sessionNotice,
      refresh,
      login: async (email, password) => {
        const version = ++generation.current
        const result = await loginAccount(email, password)
        if (version === generation.current) acceptSession(result.user, result.session)
      },
      register: async (email, password, name) => {
        return registerAccount(email, password, name)
      },
      logout: async () => {
        const id = sessionRef.current?.id
        if (!id) return
        endSession(id, false)
        await logoutAccount(id)
      },
      recordExport: async () => {
        const version = generation.current
        const result = await recordServerExport()
        if (version !== generation.current) throw new Error('Tu sesión caducó. Vuelve a entrar para descargar.')
        setUser(result.user)
        return result.user
      },
      activateLocal: async () => {
        const version = generation.current
        const result = await activateLocalPremium()
        if (version === generation.current) setUser(result.user)
      },
    }),
    [user, loading, sessionNotice, refresh, acceptSession, endSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
