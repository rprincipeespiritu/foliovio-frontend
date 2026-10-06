import { CV_PAGE_HEIGHT } from './lib'

const BLOCK_SELECTOR = 'article, h1, h2, .cv-keep, .editorial-row, .lumen-top, .noir-photo, .noir-mono'

export function computePageOffsets(root: HTMLElement, pageHeight = CV_PAGE_HEIGHT): number[] {
  const total = Math.max(root.scrollHeight, root.offsetHeight)
  if (total <= pageHeight + 12) return [0]

  const factor = (root.getBoundingClientRect().width || 1) / (root.offsetWidth || 1)
  const rootTop = root.getBoundingClientRect().top
  const toY = (el: HTMLElement) => (el.getBoundingClientRect().top - rootTop) / factor

  const ranges = [...root.querySelectorAll(BLOCK_SELECTOR)]
    .map((node) => {
      const el = node as HTMLElement
      const top = toY(el)
      return { top, bottom: top + el.offsetHeight }
    })
    .filter((range) => Number.isFinite(range.top) && range.bottom > range.top)

  const starts: number[] = [0]
  let pageStart = 0

  while (pageStart + pageHeight < total - 12 && starts.length < 12) {
    const limit = pageStart + pageHeight
    const candidates = ranges
      .map((range) => Math.round(range.top))
      .filter((y) => y > pageStart + 64 && y <= limit - 8)
      .sort((a, b) => b - a)

    let breakAt = limit
    for (const y of candidates) {
      const splits = ranges.some((range) => y > range.top + 3 && y < range.bottom - 3)
      if (!splits) {
        breakAt = y
        break
      }
    }

    if (breakAt <= pageStart + 64) breakAt = limit
    starts.push(breakAt)
    pageStart = breakAt
  }

  return starts
}

export function pageClipHeight(start: number, next: number | undefined, total: number, pageHeight = CV_PAGE_HEIGHT): number {
  const end = next ?? total
  return Math.min(pageHeight, Math.max(1, Math.round(end - start)))
}
