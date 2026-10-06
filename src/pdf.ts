const PRINT_ROOT_ID = 'vita-print-root'

function waitForImages(root: HTMLElement): Promise<void> {
  const images = [...root.querySelectorAll('img')]
  return Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    }),
  ).then(() => undefined)
}

function buildPrintRoot(source: HTMLElement): HTMLElement {
  document.getElementById(PRINT_ROOT_ID)?.remove()

  const accent = getComputedStyle(source).getPropertyValue('--cv-accent').trim() || '#1d3557'
  const root = document.createElement('div')
  root.id = PRINT_ROOT_ID

  const page = source.cloneNode(true) as HTMLElement
  page.style.zoom = '1'
  page.style.transform = 'none'
  page.style.boxShadow = 'none'
  page.style.width = '210mm'
  page.style.maxWidth = '100%'
  page.style.minHeight = '297mm'
  page.style.height = 'auto'
  page.style.overflow = 'visible'
  page.style.margin = '0'
  page.style.setProperty('--cv-accent', accent)

  root.appendChild(page)
  return root
}

export async function exportPdf(source: HTMLElement, filename: string): Promise<void> {
  await document.fonts?.ready
  const root = buildPrintRoot(source)
  document.body.appendChild(root)
  await waitForImages(root)

  const previousTitle = document.title
  document.title = filename.replace(/\.pdf$/i, '')
  document.body.classList.add('vita-printing')

  let settled = false
  const cleanup = () => {
    if (settled) return
    settled = true
    document.body.classList.remove('vita-printing')
    document.title = previousTitle
    root.remove()
  }

  window.addEventListener('afterprint', cleanup, { once: true })
  window.print()
}
