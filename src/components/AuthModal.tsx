import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth'
import { ApiError, resendVerification } from '../api'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  initialMode?: 'login' | 'resend'
}

export function AuthModal({ open, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'pending' | 'resend'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  if (!open) return null

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice('')
    try {
      if (mode === 'register') {
        const result = await register(email, password, name)
        setNotice(result.message)
        setPassword('')
        setMode('pending')
      } else if (mode === 'pending' || mode === 'resend') {
        const result = await resendVerification(email)
        setNotice(result.message)
      } else {
        await login(email, password)
        onSuccess()
      }
    } catch (caught) {
      if (caught instanceof ApiError && ['EMAIL_NOT_VERIFIED', 'VERIFICATION_EMAIL_FAILED'].includes(caught.code || '')) {
        setMode('pending')
        setPassword('')
      }
      setError(caught instanceof Error ? caught.message : 'No se pudo entrar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-chrome fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={() => { if (!busy) onClose() }}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="w-full max-w-md rounded-3xl bg-paper p-7 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => void onSubmit(event)}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] text-clay-dark uppercase">Tu cuenta</p>
        <h2 id="auth-title" className="mt-2 font-serif text-3xl tracking-tight">
          {mode === 'login' ? 'Entra a Foliovio' : mode === 'register' ? 'Crea tu cuenta' : mode === 'pending' ? 'Revisa tu correo' : 'Reenviar activación'}
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          {mode === 'login' ? 'Entra para acceder a tu plan y descargar tu currículum.' : mode === 'register' ? 'Te enviaremos un enlace para confirmar tu correo y activar la cuenta.' : 'Abre el enlace del correo y confirma la activación. Revisa también la carpeta de spam.'}
        </p>

        {mode === 'register' ? (
          <label className="mt-5 block text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase">
            Nombre
            <input className="input mt-1" maxLength={120} disabled={busy} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ) : null}
        <label className="mt-3 block text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase">
          Email
          <input
            className="input mt-1"
            type="email"
            required
            maxLength={254}
            disabled={busy}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {mode === 'login' || mode === 'register' ? <label className="mt-3 block text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase">
          Contraseña
          <input
            className="input mt-1"
            type="password"
            required
            disabled={busy}
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label> : null}

        {error ? <p role="alert" className="mt-3 text-sm text-clay-dark">{error}</p> : null}
        {notice ? <p role="status" className="mt-3 text-sm text-ink/75">{notice}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Crear cuenta' : 'Reenviar correo'}
        </button>
        <button
          type="button"
          disabled={busy}
          className="mt-2 w-full rounded-full px-4 py-2 text-sm text-ink/55 hover:bg-ink/5"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
            setNotice('')
            setPassword('')
          }}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
        </button>
        {mode === 'login' ? <button type="button" disabled={busy} className="mt-1 w-full rounded-full px-4 py-2 text-sm text-ink/55 hover:bg-ink/5" onClick={() => { setMode('resend'); setPassword(''); setError(null); setNotice('') }}>
          ¿No recibiste el correo de activación?
        </button> : null}
        <button type="button" disabled={busy} className="mt-1 w-full rounded-full px-4 py-2 text-sm text-ink/45 hover:bg-ink/5" onClick={onClose}>
          Ahora no
        </button>
      </form>
    </div>
  )
}
