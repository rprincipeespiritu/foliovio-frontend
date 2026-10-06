import type { AuthUser, Subscription } from './contracts/api'
export type { AuthUser, Subscription } from './contracts/api'

const apiUrl = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/+$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo completar la solicitud.')
  }
  return data
}

export function fetchMe() {
  return request<{ user: AuthUser | null }>('/api/auth/me')
}

export function registerAccount(email: string, password: string, name: string) {
  return request<{ user: AuthUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

export function loginAccount(email: string, password: string) {
  return request<{ user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logoutAccount() {
  return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
}

export function recordServerExport() {
  return request<{ allowed: boolean; user: AuthUser }>('/api/billing/export', { method: 'POST' })
}

export function activateLocalPremium() {
  return request<{ user: AuthUser }>('/api/billing/activate', { method: 'POST' })
}

export function fetchSubscription() {
  return request<{ subscription: Subscription }>('/api/billing/subscription')
}
