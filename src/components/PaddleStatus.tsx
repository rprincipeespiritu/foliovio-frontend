import { useEffect, useState } from 'react'
import { fetchMe, fetchPaddleConfig } from '../api'
import { useAuth } from '../auth'
import { loadPaddle } from '../paddle'

export function PaddleStatus() {
  const { refresh } = useAuth()
  const [message, setMessage] = useState('')
  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let generation = 0
    async function confirm(attempt: number, run: number) {
      try {
        const { user } = await fetchMe()
        if (stopped || run !== generation) return
        if (!user) { setMessage('Entra con la cuenta usada para pagar y consulta tu plan.'); return }
        if (user.subscription.provider === 'paddle' && user.premium) {
          await refresh()
          if (!stopped) setMessage('Foliovio Pro está activo. Ya puedes descargar tus PDF.')
          return
        }
      } catch { /* A temporary network failure must not imply payment confirmation. */ }
      if (stopped || run !== generation) return
      if (attempt >= 12) { setMessage('Tu pago aún está pendiente de confirmación. Revisa tu plan en unos minutos; no necesitas volver a pagar.'); return }
      timer = setTimeout(() => void confirm(attempt + 1, run), 2500)
    }
    function completed() {
      clearTimeout(timer)
      setMessage('Estamos esperando la confirmación del pago para activar Pro…')
      void confirm(0, ++generation)
    }
    function failed() { setMessage('No se pudo completar el pago. Revisa el mensaje del checkout o inténtalo de nuevo.') }
    function focused() { void refresh() }
    window.addEventListener('foliovio:payment-completed', completed)
    window.addEventListener('foliovio:payment-error', failed)
    window.addEventListener('focus', focused)
    // Paddle payment links require Paddle.js on the default payment URL.
    if (new URLSearchParams(window.location.search).has('_ptxn')) {
      void fetchPaddleConfig().then(config => {
        if (!stopped && config.enabled) return loadPaddle(config)
      }).catch(() => { if (!stopped) failed() })
    }
    return () => {
      stopped = true
      clearTimeout(timer)
      window.removeEventListener('foliovio:payment-completed', completed)
      window.removeEventListener('foliovio:payment-error', failed)
      window.removeEventListener('focus', focused)
    }
  }, [refresh])
  if (!message) return null
  return <div className="app-chrome fixed right-4 bottom-4 z-[70] max-w-sm rounded-2xl border border-ink/15 bg-paper p-4 shadow-xl">
    <p role="status" className="text-sm">{message}</p>
    <button type="button" className="mt-2 text-sm underline" onClick={() => setMessage('')}>Cerrar aviso</button>
  </div>
}
