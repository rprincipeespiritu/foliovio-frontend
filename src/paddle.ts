import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import type { PaddleConfig } from './api'

let instance: Promise<Paddle> | undefined
export function loadPaddle(config: Extract<PaddleConfig, { enabled: true }>) {
  instance ??= initializePaddle({
    environment: config.environment,
    token: config.clientToken,
    checkout: { settings: { displayMode: 'overlay', locale: 'es', allowLogout: false } },
    eventCallback: event => {
      if (event.name === 'checkout.completed') window.dispatchEvent(new Event('foliovio:payment-completed'))
      if (event.name === 'checkout.error' || event.name === 'checkout.payment.error') window.dispatchEvent(new Event('foliovio:payment-error'))
    },
  }).then(paddle => {
    if (!paddle) throw new Error('No se pudo abrir el pago. Inténtalo de nuevo.')
    return paddle
  }).catch(error => { instance = undefined; throw error })
  return instance
}
