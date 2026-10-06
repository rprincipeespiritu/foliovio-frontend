import { emptyCV } from '../sample'
import type { CVData } from '../types'
import { extractDocxText, extractPdfText, extractPlainText } from './extractText'
import { importConfidence, parseCvText, type ImportConfidence } from './parseCv'

export interface ImportResult {
  data: CVData
  confidence: ImportConfidence
  source: 'json' | 'text'
}

const MAX_BYTES = 8 * 1024 * 1024

export function isSupportedCvFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.pdf') ||
    name.endsWith('.docx') ||
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.json') ||
    file.type === 'application/pdf' ||
    file.type === 'application/json' ||
    file.type === 'text/plain'
  )
}

export async function importCvFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_BYTES) {
    throw new Error('El archivo es demasiado grande. Usa uno de menos de 8 MB.')
  }

  const name = file.name.toLowerCase()
  if (name.endsWith('.doc') && !name.endsWith('.docx')) {
    throw new Error('Los .doc antiguos no se pueden leer. Guárdalo como .docx o PDF e inténtalo de nuevo.')
  }

  if (!isSupportedCvFile(file) && !name.endsWith('.docx')) {
    throw new Error('Formato no soportado. Prueba con PDF, Word (.docx) o un archivo de texto.')
  }

  if (name.endsWith('.json') || file.type === 'application/json') {
    const parsed = parseJsonCv(await file.text())
    return { data: parsed, confidence: importConfidence(parsed), source: 'json' }
  }

  const buffer = await file.arrayBuffer()
  let text = ''
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    text = await extractPdfText(buffer)
  } else if (name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
    text = await extractDocxText(buffer)
  } else {
    text = await extractPlainText(file)
  }

  if (!text.trim()) {
    throw new Error('Este archivo no tiene texto seleccionable. Si es un PDF escaneado, conviértelo a Word o a un PDF con texto.')
  }

  const data = parseCvText(text)
  return { data, confidence: importConfidence(data), source: 'text' }
}

function parseJsonCv(raw: string): CVData {
  const parsed: unknown = JSON.parse(raw)
  if (isCvData(parsed)) return { ...emptyCV(), ...parsed, personal: { ...emptyCV().personal, ...parsed.personal } }
  if (parsed && typeof parsed === 'object' && 'data' in parsed && isCvData((parsed as { data: unknown }).data)) {
    const nested = (parsed as { data: CVData }).data
    return { ...emptyCV(), ...nested, personal: { ...emptyCV().personal, ...nested.personal } }
  }
  throw new Error('El JSON no tiene el formato de un currículum de Foliovio.')
}

function isCvData(value: unknown): value is CVData {
  return Boolean(value && typeof value === 'object' && 'personal' in value)
}
