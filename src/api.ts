import type { AuthUser, Subscription, RegistrationResult } from './contracts/api'
export type { AuthUser, Subscription } from './contracts/api'

const apiUrl = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/+$/, '')

export class ApiError extends Error {
  code?: string
  status?: number
  constructor(message: string, code?: string, status?: number) { super(message); this.code = code; this.status = status }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = (await response.json().catch(() => ({}))) as T & { error?: string; code?: string }
  if (!response.ok) {
    throw new ApiError(data.error || 'No se pudo completar la solicitud.', data.code, response.status)
  }
  return data
}

export function fetchMe() {
  return request<{ user: AuthUser | null }>('/api/auth/me')
}

export function registerAccount(email: string, password: string, name: string) {
  return request<RegistrationResult>('/api/auth/register', {
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

export function resendVerification(email: string) {
  return request<{ message: string }>('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) })
}

export function verifyEmail(token: string) {
  return request<{ ok: boolean; message: string }>('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
}

export function fetchSubscription() {
  return request<{ subscription: Subscription }>('/api/billing/subscription')
}

export type PaddleConfig = { enabled: false } | { enabled: true; environment: 'sandbox' | 'production'; clientToken: string; price: string }
export function fetchPaddleConfig() { return request<PaddleConfig>('/api/billing/config') }
export function createPaddleCheckout() { return request<{ transactionId: string }>('/api/billing/checkout', { method: 'POST' }) }
export function createBillingPortal() { return request<{ url: string }>('/api/billing/portal', { method: 'POST' }) }
