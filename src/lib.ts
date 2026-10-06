export const CV_PAGE_WIDTH = 794
export const CV_PAGE_HEIGHT = 1123
export const CV_PAGE_GAP = 28

export function uid(): string {
  return crypto.randomUUID()
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function bullets(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
}

export function dateRange(start: string, end: string, current: boolean): string {
  if (!start && !end && !current) return ''
  const right = current ? 'Actual' : end
  if (start && right) return `${start} — ${right}`
  return start || right
}

export function splitItems(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function fileNameFrom(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'curriculum'}.pdf`
}

export function readAndResizeImage(file: File, max = 520): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(max / image.width, max / image.height, 1)
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('No se pudo leer la imagen'))
        return
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.86))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Imagen no válida'))
    }
    image.src = url
  })
}
