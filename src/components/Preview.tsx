import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { billingConfig } from '../billing'
import { CV_PAGE_HEIGHT, CV_PAGE_WIDTH } from '../lib'
import { useCV } from '../store'
import { TemplateEditorial, TemplateLumen, TemplateNoir } from './templates'

interface PreviewProps {
  pageRef: RefObject<HTMLDivElement | null>
}

export function Preview({ pageRef }: PreviewProps) {
  const { data, settings } = useCV()
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.72)
  const [pageCount, setPageCount] = useState(1)

  const Template =
    settings.template === 'lumen'
      ? TemplateLumen
      : settings.template === 'editorial'
        ? TemplateEditorial
        : TemplateNoir

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const update = () => {
      setScale(Math.min(1, Math.max(0.42, (stage.clientWidth - 24) / CV_PAGE_WIDTH)))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const page = pageRef.current
    const inner = page?.querySelector('.cv-inner') as HTMLElement | null
    if (!page || !inner) {
      setPageCount(1)
      return
    }

    const measure = () => {
      const height = Math.max(inner.scrollHeight, page.scrollHeight, CV_PAGE_HEIGHT)
      setPageCount(Math.max(1, Math.ceil(height / CV_PAGE_HEIGHT)))
    }

    measure()
    void document.fonts?.ready.then(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [data, settings, pageRef])

  return (
    <div className="preview-panel">
      <div className="preview-toolbar mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-ink/40 uppercase">Vista previa A4</p>
          <p className="text-sm text-ink/60">
            Edita gratis. Entra con tu cuenta: el primer PDF es de cortesía y Foliovio Pro cuesta {billingConfig.price} al mes.
          </p>
        </div>
        <p className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/50">
          {pageCount === 1 ? '1 página' : `${pageCount} páginas`}
        </p>
      </div>

      <div ref={stageRef} className="flex justify-center pb-8">
        <div
          ref={pageRef}
          className="cv-page cv-page-flow"
          style={
            {
              '--cv-accent': settings.accent,
              zoom: scale,
            } as CSSProperties
          }
        >
          <Template data={data} />
        </div>
      </div>
    </div>
  )
}
