import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

interface TextItem {
  str?: string
  transform?: number[]
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
  const pages: string[] = []

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index)
    const content = await page.getTextContent()
    let lastY: number | null = null
    let lastX = 0
    const lines: string[] = []
    let current = ''

    for (const raw of content.items) {
      const item = raw as TextItem
      const text = item.str ?? ''
      if (!text) continue
      const x = item.transform?.[4] ?? 0
      const y = item.transform?.[5] ?? 0
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        if (current.trim()) lines.push(current.trim())
        current = text
      } else {
        const needsSpace = current.length > 0 && !current.endsWith(' ') && !text.startsWith(' ') && x - lastX > 1
        current += needsSpace ? ` ${text}` : text
      }
      lastY = y
      lastX = x + text.length * 4
    }
    if (current.trim()) lines.push(current.trim())
    pages.push(lines.join('\n'))
  }

  return pages.join('\n\n')
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const mod = (await import('mammoth')) as {
    default?: { extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }
    extractRawText?: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>
  }
  const extract = mod.default?.extractRawText ?? mod.extractRawText
  if (!extract) throw new Error('No se pudo leer el Word.')
  const result = await extract({ arrayBuffer: buffer })
  return result.value
}

export async function extractPlainText(file: File): Promise<string> {
  return file.text()
}
