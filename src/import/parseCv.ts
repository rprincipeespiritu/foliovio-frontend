import { uid } from '../lib'
import { emptyCV } from '../sample'
import type { CVData, EducationItem, ExperienceItem, LanguageItem, ProjectItem, SkillGroup } from '../types'

const MONTHS: Record<string, string> = {
  ene: 'Ene',
  enero: 'Ene',
  jan: 'Ene',
  january: 'Ene',
  feb: 'Feb',
  febrero: 'Feb',
  february: 'Feb',
  mar: 'Mar',
  marzo: 'Mar',
  march: 'Mar',
  abr: 'Abr',
  abril: 'Abr',
  apr: 'Abr',
  april: 'Abr',
  may: 'May',
  mayo: 'May',
  jun: 'Jun',
  junio: 'Jun',
  june: 'Jun',
  jul: 'Jul',
  julio: 'Jul',
  july: 'Jul',
  ago: 'Ago',
  agosto: 'Ago',
  aug: 'Ago',
  august: 'Ago',
  sep: 'Sep',
  sept: 'Sep',
  septiembre: 'Sep',
  september: 'Sep',
  oct: 'Oct',
  octubre: 'Oct',
  october: 'Oct',
  nov: 'Nov',
  noviembre: 'Nov',
  november: 'Nov',
  dic: 'Dic',
  diciembre: 'Dic',
  dec: 'Dic',
  december: 'Dic',
}

const MONTH_PATTERN =
  'ene(?:ro)?|feb(?:rero)?|mar(?:zo)?|abr(?:il)?|may(?:o)?|jun(?:io)?|jul(?:io)?|ago(?:sto)?|sep(?:t(?:iembre)?)?|oct(?:ubre)?|nov(?:iembre)?|dic(?:iembre)?|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?'

const YEAR_PATTERN = '(?:19|20)\\d{2}'
const CURRENT_PATTERN = 'actual(?:idad)?|presente?|now|hoy|current|ongoing|en curso'
const DATE_TOKEN = `(?:(?:${MONTH_PATTERN})\\.?\\s*)?${YEAR_PATTERN}|(?:0?[1-9]|1[0-2])[/-]${YEAR_PATTERN}`

const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:[\\-–—]|a|al|to|hasta|until)\\s*(${DATE_TOKEN}|${CURRENT_PATTERN})`,
  'i',
)

const SINGLE_YEAR_RANGE_RE = new RegExp(`^(${YEAR_PATTERN})\\s*[\\-–—/]\\s*(${YEAR_PATTERN}|${CURRENT_PATTERN})$`, 'i')

const JOB_HINT =
  /\b(engineer|developer|designer|director|manager|analyst|consultant|lead|head|founder|intern|ingenier[oa]|desarrollador(?:a)?|diseñador(?:a)?|director(?:a)?|gerente|analista|consultor(?:a)?|responsable|coordinador(?:a)?|técnic[oa]|programador(?:a)?|arquitect[oa]|especialista|becari[oa]|ceo|cto|cpo|product owner|scrum)\b/i

const SCHOOL_HINT =
  /\b(universidad|university|instituto|college|escuela|school|elisava|uoc|upm|upc|uam|ucm|unam|itesm|tec de|bootcamp|máster|master|grado|licenciatura|diplomatura|phd|doctorado|fp |formación profesional)\b/i

type SectionId = 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'contact'

const SECTION_MATCHERS: { id: Exclude<SectionId, 'header'>; pattern: RegExp }[] = [
  { id: 'summary', pattern: /^(perfil(?:\s+profesional)?|resumen(?:\s+profesional)?|about(?:\s+me)?|summary|objetivo(?:\s+profesional)?|sobre\s+m[ií]|acerca\s+de(?:\s+m[ií])?)$/i },
  { id: 'experience', pattern: /^(experiencia(?:\s+(?:profesional|laboral))?|work\s+experience|employment(?:\s+history)?|historial(?:\s+laboral)?|trayectoria(?:\s+profesional)?)$/i },
  { id: 'education', pattern: /^(formaci[oó]n(?:\s+acad[eé]mica)?|educaci[oó]n|education|estudios|academic\s+background)$/i },
  { id: 'skills', pattern: /^(habilidades|competencias|skills|conocimientos(?:\s+t[eé]cnicos)?|tecnolog[ií]as|technical\s+skills|stack)$/i },
  { id: 'languages', pattern: /^(idiomas|languages)$/i },
  { id: 'projects', pattern: /^(proyectos|projects)$/i },
  { id: 'contact', pattern: /^(contacto|contact|datos\s+personales|personal\s+(?:info(?:rmation)?|details))$/i },
]

export type ImportConfidence = 'good' | 'partial' | 'empty'

export function importConfidence(data: CVData): ImportConfidence {
  const personal = data.personal
  const blocks = data.experience.length + data.education.length + data.skills.length + data.projects.length
  if (!personal.fullName && !personal.email && blocks === 0) return 'empty'
  if (personal.fullName && (personal.email || blocks >= 1)) return 'good'
  return 'partial'
}

export function parseCvText(raw: string): CVData {
  const text = normalize(raw)
  const lines = toLines(text)
  const sections = splitSections(lines)
  const contacts = extractContacts(text)

  const headerLines = [...(sections.get('header') ?? []), ...(sections.get('contact') ?? [])]
  const header = parseHeader(headerLines, contacts)

  const summaryFromSection = (sections.get('summary') ?? []).join(' ').trim()
  const experience = parseExperience(sections.get('experience') ?? [])
  const education = parseEducation(sections.get('education') ?? [])
  const skills = parseSkills(sections.get('skills') ?? [])
  const languages = parseLanguages(sections.get('languages') ?? [])
  const projects = parseProjects(sections.get('projects') ?? [])

  let inferredExperience = experience
  let inferredEducation = education
  if (experience.length === 0 && education.length === 0) {
    const rest = lines.filter((line) => !isContactLine(line) && line !== header.fullName && line !== header.title)
    inferredExperience = parseExperience(rest)
    if (inferredEducation.length === 0) inferredEducation = parseEducation(rest.filter((line) => SCHOOL_HINT.test(line) || isDateLine(line)))
  }

  const cv = emptyCV()
  cv.personal = {
    ...cv.personal,
    ...header,
    email: header.email || contacts.email,
    phone: header.phone || contacts.phone,
    website: header.website || contacts.website,
    linkedin: header.linkedin || contacts.linkedin,
    summary: summaryFromSection || header.summary,
    photo: null,
  }
  cv.experience = inferredExperience
  cv.education = inferredEducation
  cv.skills = skills
  cv.languages = languages
  cv.projects = projects
  return cv
}

function normalize(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[•●▪◦‣∙]/g, '•')
    .replace(/[–—]/g, '–')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^(página|page)\s*\d+/i.test(line) && !/^\d+\s*\/\s*\d+$/.test(line))
}

function matchSectionHeader(line: string): Exclude<SectionId, 'header'> | null {
  const cleaned = line
    .replace(/^[\d]+[\.)]\s*/, '')
    .replace(/^[#*_>\-–—•]+/, '')
    .replace(/[:.\-–—•*_]+$/, '')
    .trim()
  if (!cleaned || cleaned.length > 46) return null
  for (const entry of SECTION_MATCHERS) {
    if (entry.pattern.test(cleaned)) return entry.id
  }
  return null
}

function splitSections(lines: string[]): Map<SectionId, string[]> {
  const map = new Map<SectionId, string[]>()
  let current: SectionId = 'header'
  map.set('header', [])
  for (const line of lines) {
    const section = matchSectionHeader(line)
    if (section) {
      current = section
      if (!map.has(current)) map.set(current, [])
      continue
    }
    const bucket = map.get(current) ?? []
    bucket.push(line)
    map.set(current, bucket)
  }
  return map
}

function extractContacts(text: string): { email: string; phone: string; linkedin: string; website: string } {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? ''
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%/]+/i)?.[0] ?? ''
  const linkedin = linkedinMatch.replace(/\/$/, '').replace(/^https?:\/\//, '')
  const phoneMatch =
    text.match(/(?:\+|00)\s?\d{1,3}(?:[\s.-]?\d){8,12}/)?.[0] ??
    text.match(/\b\d{3}[\s.-]\d{3}[\s.-]\d{3,4}\b/)?.[0] ??
    ''
  const urls = [...text.matchAll(/https?:\/\/[^\s)]+/gi)].map((match) => match[0].replace(/[.,;]+$/, ''))
  const website =
    urls.find((url) => !/linkedin\.com|facebook\.com|twitter\.com|instagram\.com/i.test(url))?.replace(/^https?:\/\//, '') ??
    ''
  return { email, phone: cleanPhone(phoneMatch), linkedin, website }
}

function cleanPhone(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function isContactLine(line: string): boolean {
  return /@/.test(line) || /linkedin\.com/i.test(line) || /(?:\+|00)\s?\d/.test(line) || /https?:\/\//i.test(line)
}

function looksLikeName(line: string): boolean {
  if (line.length < 4 || line.length > 56 || /@|\d/.test(line)) return false
  const words = line.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 5) return false
  return words.every((word) => /^[A-ZÁÉÍÓÚÑÜ][A-Za-zÁÉÍÓÚáéíóúÑñÜü'’\-]+$/.test(word) || word === word.toUpperCase())
}

function looksLikeLocation(line: string): boolean {
  return /madrid|barcelona|valencia|sevilla|bilbao|málaga|zaragoza|españa|spain|mexico|méxico|argentina|colombia|chile|perú|lima|bogot[aá]|buenos aires|remoto|remote|híbrido/i.test(
    line,
  ) || /^[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚáéíóúñ\s]+,\s*[A-ZÁÉÍÓÚÑ]/.test(line)
}

function parseHeader(
  lines: string[],
  contacts: { email: string; phone: string; linkedin: string; website: string },
): CVData['personal'] {
  const personal = emptyCV().personal
  const leftover: string[] = []
  for (const line of lines) {
    if (isContactLine(line)) continue
    if (!personal.fullName && looksLikeName(line)) {
      personal.fullName = toTitleCaseName(line)
      continue
    }
    if (personal.fullName && !personal.title && !looksLikeLocation(line) && line.length <= 70 && !isDateLine(line)) {
      personal.title = line
      continue
    }
    if (!personal.location && looksLikeLocation(line) && line.length <= 60) {
      personal.location = line
      continue
    }
    leftover.push(line)
  }
  if (!personal.fullName) {
    const guess = lines.find((line) => looksLikeName(line))
    if (guess) personal.fullName = toTitleCaseName(guess)
  }
  const summaryBits = leftover.filter((line) => line.length > 40 || leftover.length === 1)
  personal.summary = summaryBits.join(' ').trim()
  personal.email = contacts.email
  personal.phone = contacts.phone
  personal.linkedin = contacts.linkedin
  personal.website = contacts.website
  return personal
}

function toTitleCaseName(line: string): string {
  if (line !== line.toUpperCase()) return line
  return line
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function isDateLine(line: string): boolean {
  const compact = line.replace(/[()]/g, '').trim()
  if (compact.length > 42) return false
  return DATE_RANGE_RE.test(compact) || SINGLE_YEAR_RANGE_RE.test(compact)
}

function parseDateToken(token: string): { label: string; current: boolean } {
  const trimmed = token.trim()
  if (new RegExp(`^(?:${CURRENT_PATTERN})$`, 'i').test(trimmed)) return { label: '', current: true }
  const monthYear = trimmed.match(new RegExp(`^(${MONTH_PATTERN})\\.?\\s*(${YEAR_PATTERN})$`, 'i'))
  if (monthYear) {
    const month = MONTHS[monthYear[1].toLowerCase().slice(0, 3)] ?? monthYear[1]
    return { label: `${month} ${monthYear[2]}`, current: false }
  }
  const numeric = trimmed.match(new RegExp(`^(0?[1-9]|1[0-2])[/-](${YEAR_PATTERN})$`))
  if (numeric) {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return { label: `${monthNames[Number(numeric[1]) - 1]} ${numeric[2]}`, current: false }
  }
  const year = trimmed.match(new RegExp(YEAR_PATTERN))
  return { label: year?.[0] ?? trimmed, current: false }
}

function parseDateRange(line: string): { startDate: string; endDate: string; current: boolean } | null {
  const compact = line.replace(/[()]/g, '').trim()
  const range = compact.match(DATE_RANGE_RE) ?? compact.match(SINGLE_YEAR_RANGE_RE)
  if (!range) return null
  const start = parseDateToken(range[1])
  const end = parseDateToken(range[2])
  return {
    startDate: start.label,
    endDate: end.current ? '' : end.label,
    current: end.current,
  }
}

function isBullet(line: string): boolean {
  return /^[•\-–]/.test(line)
}

function isNextEntryMeta(lines: string[], index: number): boolean {
  if (isBullet(lines[index]) || isDateLine(lines[index])) return false
  const upcoming = lines.slice(index, index + 4).some((line) => isDateLine(line))
  if (!upcoming) return false
  const line = lines[index]
  return JOB_HINT.test(line) || SCHOOL_HINT.test(line) || /[|·]/.test(line) || /\s(?:en|at|@)\s/i.test(line)
}

function splitDatedEntries(lines: string[]): { meta: string[]; dateLine: string | null; body: string[] }[] {
  const dateIndexes = lines.map((line, index) => (isDateLine(line) ? index : -1)).filter((index) => index >= 0)
  if (dateIndexes.length === 0) {
    if (lines.length === 0) return []
    return [{ meta: lines.slice(0, 2), dateLine: null, body: lines.slice(2) }]
  }

  const used = new Set<number>()
  return dateIndexes.map((dateIndex) => {
    const meta: string[] = []
    for (let cursor = dateIndex - 1; cursor >= 0 && meta.length < 3; cursor -= 1) {
      if (used.has(cursor) || isDateLine(lines[cursor]) || isBullet(lines[cursor])) break
      meta.unshift(lines[cursor])
      used.add(cursor)
    }
    used.add(dateIndex)
    const body: string[] = []
    for (let cursor = dateIndex + 1; cursor < lines.length; cursor += 1) {
      if (isDateLine(lines[cursor]) || isNextEntryMeta(lines, cursor)) break
      body.push(lines[cursor])
      used.add(cursor)
    }
    return { meta, dateLine: lines[dateIndex], body }
  })
}

function assignRoleCompany(meta: string[]): { role: string; company: string; location: string } {
  let role = ''
  let company = ''
  let location = ''
  const primary = meta[0] ?? ''

  if (/[|·/]/.test(primary)) {
    const parts = primary
      .split(/\s*[|·/]\s*/)
      .map((part) => part.trim())
      .filter(Boolean)
    role = parts[0] ?? ''
    company = parts[1] ?? ''
    location = parts[2] ?? ''
  } else {
    const dashParts = primary.split(/\s+[–-]\s+/).map((part) => part.trim())
    if (dashParts.length === 2) {
      if (JOB_HINT.test(dashParts[1]) && !JOB_HINT.test(dashParts[0])) {
        company = dashParts[0]
        role = dashParts[1]
      } else if (JOB_HINT.test(dashParts[0])) {
        role = dashParts[0]
        company = dashParts[1]
      }
    }
    if (!role && !company) {
      const atMatch = primary.match(/^(.*?)\s+(?:en|at|@)\s+(.*)$/i)
      if (atMatch) {
        role = atMatch[1]
        company = atMatch[2]
      } else if (JOB_HINT.test(primary)) {
        role = primary
        company = meta[1] ?? ''
      } else {
        company = primary
        role = meta[1] ?? ''
      }
    }
  }

  const locLine = meta.find(
    (line) =>
      looksLikeLocation(line) &&
      line !== role &&
      line !== company &&
      line !== primary &&
      !/[|·/]/.test(line),
  )
  if (locLine) location = locLine
  return { role, company, location }
}

function parseExperience(lines: string[]): ExperienceItem[] {
  return splitDatedEntries(lines)
    .map((chunk) => {
      const dates = chunk.dateLine ? parseDateRange(chunk.dateLine) : { startDate: '', endDate: '', current: false }
      const { role, company, location } = assignRoleCompany(chunk.meta)
      const description = chunk.body
        .map((line) => line.replace(/^[•\-–]\s*/, ''))
        .filter((line) => line && line !== location)
        .join('\n')
      if (!role && !company && !description) return null
      return {
        id: uid(),
        role,
        company,
        location,
        startDate: dates?.startDate ?? '',
        endDate: dates?.endDate ?? '',
        current: dates?.current ?? false,
        description,
      } satisfies ExperienceItem
    })
    .filter((item): item is ExperienceItem => item !== null)
}

function parseEducation(lines: string[]): EducationItem[] {
  return splitDatedEntries(lines)
    .map((chunk) => {
      const dates = chunk.dateLine ? parseDateRange(chunk.dateLine) : { startDate: '', endDate: '', current: false }
      const others = [...chunk.meta, ...chunk.body]
      if (others.length === 0) return null
      let degree = others[0] ?? ''
      let school = others[1] ?? ''
      if (SCHOOL_HINT.test(others[0] ?? '') && others[1] && !SCHOOL_HINT.test(others[1])) {
        school = others[0]
        degree = others[1]
      }
      const location = others.find((line) => looksLikeLocation(line) && line !== degree && line !== school) ?? ''
      const details = others.filter((line) => line !== degree && line !== school && line !== location).join(' ')
      if (!degree && !school) return null
      return {
        id: uid(),
        school,
        degree,
        location,
        startDate: dates?.startDate ?? '',
        endDate: dates?.endDate ?? '',
        details,
      } satisfies EducationItem
    })
    .filter((item): item is EducationItem => item !== null)
}

function parseSkills(lines: string[]): SkillGroup[] {
  if (lines.length === 0) return []
  const grouped = lines.filter((line) => /:/.test(line) && line.split(':')[0].length < 28)
  if (grouped.length >= 1 && grouped.length >= Math.ceil(lines.length / 2)) {
    return grouped
      .map((line) => {
        const [name, ...rest] = line.split(':')
        return { id: uid(), name: name.trim(), items: rest.join(':').replace(/[•\-–]/g, ',').trim() }
      })
      .filter((group) => group.items)
  }
  const items = lines
    .flatMap((line) => line.split(/[,;•|·]/))
    .map((item) => item.replace(/^[\-–]\s*/, '').trim())
    .filter((item) => item.length > 1 && item.length < 40)
  if (items.length === 0) return []
  return [{ id: uid(), name: 'Habilidades', items: unique(items).join(', ') }]
}

function parseLanguages(lines: string[]): LanguageItem[] {
  const blob = lines.join('\n')
  const pieces = blob.split(/[,;\n]/).map((piece) => piece.trim()).filter(Boolean)
  return pieces
    .map((piece) => {
      const match = piece.match(/^([^:(–—-]+)\s*[:(\–—-]\s*([^)]+)\)?$/)
      if (match) return { id: uid(), name: match[1].trim(), level: match[2].trim() }
      if (/^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]{2,20}$/.test(piece)) return { id: uid(), name: piece, level: '' }
      return null
    })
    .filter((item): item is LanguageItem => item !== null)
}

function parseProjects(lines: string[]): ProjectItem[] {
  const chunks: string[][] = []
  let current: string[] = []
  for (const line of lines) {
    if (current.length && !/^[•\-–]/.test(line) && line.length < 50 && !/^https?:/i.test(line) && current.length >= 2) {
      chunks.push(current)
      current = [line]
      continue
    }
    current.push(line)
  }
  if (current.length) chunks.push(current)
  return chunks
    .map((chunk) => {
      const link = chunk.find((line) => /https?:\/\//i.test(line) || /github\.com|gitlab\.com/i.test(line)) ?? ''
      const name = chunk.find((line) => line !== link && !/^[•\-–]/.test(line)) ?? ''
      const description = chunk
        .filter((line) => line !== name && line !== link)
        .map((line) => line.replace(/^[•\-–]\s*/, ''))
        .join(' ')
      if (!name) return null
      return {
        id: uid(),
        name,
        link: link.replace(/^https?:\/\//, ''),
        description,
      } satisfies ProjectItem
    })
    .filter((item): item is ProjectItem => item !== null)
}

function unique(items: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}
