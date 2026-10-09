import { Check, Lock, MessageCircle, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPaddleCheckout, fetchPaddleConfig, type PaddleConfig } from '../api'
import { loadPaddle } from '../paddle'
import { billingConfig, checkoutHref, mailtoHref, whatsappHref } from '../billing'

interface PaywallProps {
  open: boolean
  email?: string | null
  onClose: () => void
  onUnlockLocal?: () => void
  onAuth: () => void
}

const PERKS = [
  'PDFs ilimitados mientras tu suscripción esté activa',
  'Todas las plantillas y colores',
  'El editor y la vista previa siguen gratis',
]

export function Paywall({ open, email, onClose, onUnlockLocal, onAuth }: PaywallProps) {
  const [paddleConfig, setPaddleConfig] = useState<PaddleConfig | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let canceled = false
    void fetchPaddleConfig().then(config => { if (!canceled) setPaddleConfig(config) })
      .catch(() => { if (!canceled) { setPaddleConfig({ enabled: false }); setError('No pudimos consultar las opciones de pago. Vuelve a abrir esta ventana para reintentar.') } })
    return () => { canceled = true }
  }, [])
  async function subscribe() {
    if (!email) { onAuth(); return }
    if (!paddleConfig?.enabled || busy) return
    setBusy(true)
    setError('')
    try {
      const paddle = await loadPaddle(paddleConfig)
      const { transactionId } = await createPaddleCheckout()
      paddle.Checkout.open({ transactionId })
      onClose()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo abrir el pago.') }
    finally { setBusy(false) }
  }
  if (!open) return null

  const checkout = paddleConfig?.enabled ? null : checkoutHref(email)
  const price = paddleConfig?.enabled ? paddleConfig.price : billingConfig.price
  const whatsapp = whatsappHref(email)
  const mail = mailtoHref(email)

  return (
    <div
      className="app-chrome fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={() => { if (!busy) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        className="w-full max-w-md rounded-3xl bg-paper p-7 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-clay-dark uppercase">
          <Sparkles size={12} />
          Foliovio Pro
        </p>
        <h2 id="paywall-title" className="mt-3 font-serif text-3xl tracking-tight">
          Plan mensual
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Por {price} al mes exportas el currículum las veces que quieras con tu cuenta.
        </p>

        <p className="mt-5 font-serif text-4xl tracking-tight">
          {price}
          <span className="ml-2 align-middle text-sm font-sans font-normal text-ink/45">al mes</span>
        </p>

        <ul className="mt-5 space-y-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm text-ink/75">
              <Check size={16} className="mt-0.5 shrink-0 text-clay" />
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2">
          {!paddleConfig && <p role="status" className="text-sm">Cargando opciones de pago…</p>}
          {error && <p role="alert" className="rounded-xl border border-clay/30 p-3 text-sm text-clay-dark">{error}</p>}
          {paddleConfig?.enabled && <>
            <p className="text-xs text-ink/60">Renovación automática mensual. Puedes cancelar desde Mi cuenta. El importe final y los impuestos se muestran antes de pagar.</p>
            {paddleConfig.environment === 'sandbox' && <p className="text-xs font-semibold text-clay-dark">Modo de prueba: no se realizan cobros reales.</p>}
            <button type="button" disabled={busy} onClick={() => void subscribe()} className="flex w-full items-center justify-center gap-2 rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-white hover:bg-clay-dark disabled:opacity-60">
              <Lock size={14} />{busy ? 'Abriendo pago…' : email ? 'Suscribirme con Paddle' : 'Entrar para suscribirme'}
            </button>
          </>}
          {paddleConfig && checkout ? (
            <a
              href={checkout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-white hover:bg-clay-dark"
            >
              <Lock size={14} />
              Suscribirme
            </a>
          ) : null}
          {paddleConfig && !paddleConfig.enabled && whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink/90"
            >
              <MessageCircle size={14} />
              Pagar por WhatsApp
            </a>
          ) : null}
          {paddleConfig && !paddleConfig.enabled && !checkout && !whatsapp && mail ? (
            <a
              href={mail}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-white hover:bg-clay-dark"
            >
              Pedir Foliovio Pro
            </a>
          ) : null}
          {paddleConfig && !paddleConfig.enabled && !checkout && !whatsapp && !mail ? (
            <p className="rounded-2xl bg-ink/5 px-3 py-2 text-sm text-ink/55">
              Las suscripciones aún no están disponibles. Inténtalo más tarde.
            </p>
          ) : null}
          {onUnlockLocal && !paddleConfig?.enabled ? (
            <button
              type="button"
              onClick={onUnlockLocal}
              className="w-full rounded-full px-4 py-2 text-sm text-ink/55 hover:bg-ink/5"
            >
              Activar Pro de prueba en esta cuenta
            </button>
          ) : null}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="mt-3 w-full rounded-full px-4 py-2 text-sm text-ink/50 hover:bg-ink/5"
        >
          Seguir editando
        </button>
      </div>
    </div>
  )
}
