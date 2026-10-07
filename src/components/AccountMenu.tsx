import { LogIn, LogOut, UserRound } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { AuthUser } from '../api'

interface AccountMenuProps {
  user: AuthUser | null
  loading: boolean
  onAuth: () => void
  onLogout: () => Promise<void>
}

export function AccountMenu({ user, loading, onAuth, onLogout }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const actionRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const name = user?.name.trim() || user?.email.split('@')[0] || ''
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase()

  function close(restoreFocus = false) {
    setOpen(false)
    setConfirming(false)
    setError('')
    if (restoreFocus) avatarRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    if (confirming) cancelRef.current?.focus()
    else actionRef.current?.focus()

    function onPointerDown(event: PointerEvent) {
      if (!signingOut && !containerRef.current?.contains(event.target as Node)) close()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (!signingOut) close(true)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, confirming, signingOut])

  async function confirmLogout() {
    if (signingOut) return
    setSigningOut(true)
    setError('')
    try {
      await onLogout()
      close(true)
    } catch {
      setError('No se pudo cerrar la sesión. Inténtalo de nuevo.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative shrink-0 self-start"
      onBlur={(event) => {
        if (!signingOut && !event.currentTarget.contains(event.relatedTarget as Node | null)) close()
      }}
    >
      <button
        ref={avatarRef}
        type="button"
        aria-label={loading ? 'Cargando cuenta' : user ? `Mi cuenta: ${name}` : 'Abrir opciones de cuenta'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        disabled={loading}
        aria-disabled={signingOut || loading}
        onClick={() => {
          if (signingOut) return
          if (open) close()
          else setOpen(true)
        }}
        className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-stone text-sm font-semibold text-ink transition hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay disabled:opacity-60"
      >
        {user ? <span aria-hidden="true">{initials}</span> : <UserRound size={21} aria-hidden="true" />}
      </button>

      {open && (
        <section
          id={panelId}
          aria-label="Opciones de cuenta"
          aria-busy={signingOut}
          className="absolute top-full right-0 z-30 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink/10 bg-paper p-5 shadow-xl"
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-ink/50 uppercase">Mi cuenta</p>
          {user ? (
            <div className="mt-3 border-b border-ink/10 pb-4">
              <p className="break-words font-semibold text-ink">{name}</p>
              <p className="mt-1 break-words text-sm text-ink/65">{user.email}</p>
              <span className="mt-3 inline-block rounded-full bg-clay/10 px-2.5 py-1 text-xs font-semibold text-clay-dark">
                {user.premium ? 'Foliovio Pro' : 'Plan gratuito'}
              </span>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-semibold">Invitado</p>
              <p className="mt-1 text-sm text-ink/65">Entra para ver los datos de tu cuenta y tu suscripción.</p>
            </div>
          )}

          {user && confirming ? (
            <div className="mt-4">
              <p className="font-semibold">¿Cerrar sesión?</p>
              <p className="mt-1 text-sm text-ink/65">Tu currículum seguirá guardado en este navegador.</p>
              <div className="mt-4 flex gap-2">
                <button
                  ref={cancelRef}
                  type="button"
                  disabled={signingOut}
                  onClick={() => { setConfirming(false); setError('') }}
                  className="flex-1 rounded-full border border-ink/15 px-3 py-2 text-sm hover:bg-ink/5 disabled:opacity-60"
                >Cancelar</button>
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => void confirmLogout()}
                  className="flex-1 rounded-full bg-clay px-3 py-2 text-sm font-semibold text-white hover:bg-clay-dark disabled:opacity-60"
                >{signingOut ? 'Saliendo…' : 'Sí, salir'}</button>
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-clay-dark">{error}</p>}
            </div>
          ) : (
            <button
              ref={actionRef}
              type="button"
              onClick={() => {
                if (user) setConfirming(true)
                else { close(); onAuth() }
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90"
            >
              {user ? <LogOut size={16} aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />}
              {user ? 'Salir' : 'Entrar'}
            </button>
          )}
        </section>
      )}
    </div>
  )
}
