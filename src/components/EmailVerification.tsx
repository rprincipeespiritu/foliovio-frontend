import { useState } from 'react'
import { verifyEmail } from '../api'

interface EmailVerificationProps {
  token: string
  onClose: () => void
  onLogin: () => void
  onResend: () => void
}

export function EmailVerification({ token, onClose, onLogin, onResend }: EmailVerificationProps) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function activate() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await verifyEmail(token)
      setDone(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo activar la cuenta. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-chrome fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="verification-title" className="w-full max-w-md rounded-3xl bg-paper p-7 shadow-xl">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-clay-dark uppercase">Tu cuenta</p>
        <h2 id="verification-title" className="mt-2 font-serif text-3xl tracking-tight">{done ? 'Cuenta activada' : 'Confirma tu correo'}</h2>
        <p role="status" className="mt-3 text-sm text-ink/65">{done ? 'Tu correo está confirmado. Ya puedes entrar con tu email y contraseña.' : 'Pulsa el botón para activar la cuenta que registraste en Foliovio. El enlace es válido durante 24 horas.'}</p>
        {error && <p role="alert" className="mt-3 text-sm text-clay-dark">{error}</p>}
        <button type="button" disabled={busy} onClick={() => done ? onLogin() : void activate()} className="mt-5 w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60">
          {busy ? 'Activando…' : done ? 'Entrar' : 'Activar mi cuenta'}
        </button>
        {!done && <button type="button" disabled={busy} onClick={onResend} className="mt-2 w-full rounded-full px-4 py-2 text-sm text-ink/60 hover:bg-ink/5">Solicitar otro enlace</button>}
        <button type="button" disabled={busy} onClick={onClose} className="mt-1 w-full rounded-full px-4 py-2 text-sm text-ink/45 hover:bg-ink/5">Cerrar</button>
      </section>
    </div>
  )
}
