export const billingConfig = {
  price: import.meta.env.VITE_PRICE?.trim() || 'S/ 19',
  checkoutUrl: import.meta.env.VITE_CHECKOUT_URL?.trim() || '',
  whatsapp: import.meta.env.VITE_WHATSAPP?.trim() || '',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL?.trim() || '',
}

export function checkoutHref(email?: string | null): string | null {
  if (!billingConfig.checkoutUrl) return null
  try {
    const url = new URL(billingConfig.checkoutUrl)
    if (email) url.searchParams.set('customer_email', email)
    return url.toString()
  } catch {
    return billingConfig.checkoutUrl
  }
}

export function whatsappHref(email?: string | null): string | null {
  const phone = billingConfig.whatsapp.replace(/\D/g, '')
  if (!phone) return null
  const extra = email ? ` Mi email en Foliovio es ${email}.` : ''
  const text = encodeURIComponent(
    `Hola, quiero el plan mensual de Foliovio Pro (${billingConfig.price}).${extra}`,
  )
  return `https://wa.me/${phone}?text=${text}`
}

export function mailtoHref(email?: string | null): string | null {
  if (!billingConfig.contactEmail) return null
  const extra = email ? ` Mi email en Foliovio es ${email}.` : ''
  const subject = encodeURIComponent('Quiero Foliovio Pro')
  const body = encodeURIComponent(`Hola, quiero el plan mensual de Foliovio Pro (${billingConfig.price}).${extra}`)
  return `mailto:${billingConfig.contactEmail}?subject=${subject}&body=${body}`
}
