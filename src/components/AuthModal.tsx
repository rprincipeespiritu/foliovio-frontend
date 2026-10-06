import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!open) return null

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'register') await register(email, password, name)
      else await login(email, password)
      onSuccess()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo entrar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-chrome fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        className="w-full max-w-md rounded-3xl bg-paper p-7 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => void onSubmit(event)}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] text-clay-dark uppercase">Tu cuenta</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight">
          {mode === 'login' ? 'Entra a Foliovio' : 'Crea tu cuenta'}
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Así sabemos qué usuario tiene el plan mensual de S/ 19 y cuántos PDFs ha descargado.
        </p>

        {mode === 'register' ? (
          <label className="mt-5 block text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase">
            Nombre
            <input className="input mt-1" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ) : null}
        <label className="mt-3 block text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase">
          Email
          <input
            className="input mt-1"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-3 block text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase">
          Contraseña
          <input
            className="input mt-1"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="mt-3 text-sm text-clay-dark">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
        <button
          type="button"
          className="mt-2 w-full rounded-full px-4 py-2 text-sm text-ink/55 hover:bg-ink/5"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
        </button>
        <button type="button" className="mt-1 w-full rounded-full px-4 py-2 text-sm text-ink/45 hover:bg-ink/5" onClick={onClose}>
          Ahora no
        </button>
      </form>
    </div>
  )
}
