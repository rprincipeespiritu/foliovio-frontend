import { Download, FileUp, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'
import type { AuthUser } from '../api'
import { useCV } from '../store'
import { ACCENTS, TEMPLATES } from '../types'
import { AccountMenu } from './AccountMenu'

interface TopBarProps {
  exporting: boolean
  importing: boolean
  user: AuthUser | null
  loadingAccount: boolean
  onExport: () => void
  onUnlock: () => void
  onAuth: () => void
  onLogout: () => Promise<void>
  onImportFile: (file: File) => void
}

export function TopBar({
  exporting,
  importing,
  user,
  loadingAccount,
  onExport,
  onUnlock,
  onAuth,
  onLogout,
  onImportFile,
}: TopBarProps) {
  const { settings, updateSettings, loadSample, clearAll } = useCV()
  const fileRef = useRef<HTMLInputElement>(null)

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onImportFile(file)
    event.target.value = ''
  }

  return (
    <header className="app-chrome sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-ink/8 bg-paper/85 px-4 py-3 backdrop-blur-md">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="mr-2 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-[15px] font-semibold tracking-tight text-paper">
            F
          </span>
          <div>
            <p className="font-serif text-lg leading-none tracking-tight">Foliovio</p>
            <p className="text-[11px] tracking-[0.16em] text-ink/45 uppercase">Currículum</p>
          </div>
          {user?.premium ? (
            <span className="rounded-full bg-clay/12 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-clay-dark uppercase">
              Pro
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-full bg-ink/5 p-1">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => updateSettings({ template: template.id })}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                settings.template === template.id
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {ACCENTS.map((accent) => (
            <button
              key={accent.id}
              type="button"
              title={accent.label}
              aria-label={accent.label}
              onClick={() => updateSettings({ accent: accent.value })}
              className={`h-6 w-6 rounded-full border-2 transition ${
                settings.accent === accent.value ? 'border-ink scale-110' : 'border-white/80'
              }`}
              style={{ background: accent.value }}
            />
          ))}
        </div>

      </div>
      <AccountMenu user={user} loading={loadingAccount} onAuth={onAuth} onLogout={onLogout} />

      <div className="col-span-2 flex flex-wrap items-center justify-end gap-2">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.md,.json,application/pdf,application/json,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onPick}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-paper hover:bg-ink/90 disabled:opacity-60"
        >
          <FileUp size={14} />
          {importing ? 'Importando…' : 'Importar CV'}
        </button>
        <button
          type="button"
          onClick={loadSample}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/70 hover:bg-ink/5"
        >
          <RotateCcw size={14} />
          Ejemplo
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/70 hover:bg-ink/5"
        >
          <Trash2 size={14} />
          Vaciar
        </button>
        {!user?.premium ? (
          <button
            type="button"
            onClick={onUnlock}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/70 hover:bg-ink/5"
          >
            <Sparkles size={14} />
            Pro
          </button>
        ) : null}
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clay-dark disabled:opacity-60"
        >
          <Download size={15} />
          {exporting
            ? 'Generando…'
            : user && !user.premium && user.remainingFree === 0
              ? 'Desbloquear PDF'
              : 'Descargar PDF'}
        </button>
      </div>
    </header>
  )
}
