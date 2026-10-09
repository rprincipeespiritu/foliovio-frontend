import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './auth'
import { AuthModal } from './components/AuthModal'
import { EmailVerification } from './components/EmailVerification'
import { Editor } from './components/Editor'
import { Paywall } from './components/Paywall'
import { PaddleStatus } from './components/PaddleStatus'
import { Preview } from './components/Preview'
import { TopBar } from './components/TopBar'
import { fileNameFrom } from './lib'
import { exportPdf } from './pdf'
import { useCV } from './store'

const MESSAGES = {
  good: 'Currículum importado. Revisa fechas y viñetas: los PDF a veces mezclan columnas.',
  partial: 'Importamos una parte. Completa lo que falte en el editor.',
  empty: 'No encontramos un texto claro. Si es un PDF escaneado, prueba un Word o un PDF con texto seleccionable.',
}

export default function App() {
  const pageRef = useRef<HTMLDivElement>(null)
  const { data, importData } = useCV()
  const { user, loading, recordExport, activateLocal, logout, refresh } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'resend'>('login')
  const [verificationToken, setVerificationToken] = useState<string | null>(() => new URLSearchParams(window.location.hash.slice(1)).get('verify-email'))
  const [pendingExport, setPendingExport] = useState(false)

  useEffect(() => {
    if (verificationToken !== null) {
      // Keep the token only in memory, out of history and subsequent copied URLs.
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [verificationToken])

  useEffect(() => {
    if (!pendingExport || !user) return
    setPendingExport(false)
    setAuthOpen(false)
    if (!user.premium && user.remainingFree === 0) {
      setPaywallOpen(true)
      return
    }
    void runExport()
  }, [user, pendingExport])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paid = params.get('paid') === '1' || params.get('checkout') === 'success'
    if (!paid) return
    const url = new URL(window.location.href)
    url.searchParams.delete('paid')
    url.searchParams.delete('checkout')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    void refresh().then(() => {
      setNotice('Si el pago se confirmó, Foliovio Pro ya está en tu cuenta. Si pagaste por WhatsApp, te lo activamos con tu email.')
    })
  }, [refresh])

  async function runExport() {
    if (!pageRef.current) return
    setExporting(true)
    setError(null)
    try {
      await recordExport()
      await exportPdf(pageRef.current, fileNameFrom(data.personal.fullName))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo generar el PDF. Prueba de nuevo.')
    } finally {
      setExporting(false)
    }
  }

  async function handleExport() {
    if (!user) {
      setPendingExport(true)
      setAuthOpen(true)
      return
    }
    if (!user.premium && user.remainingFree === 0) {
      setPaywallOpen(true)
      return
    }
    await runExport()
  }

  function handleAuthSuccess() {
    setAuthOpen(false)
  }

  async function handleUnlockLocal() {
    try {
      await activateLocal()
      setPaywallOpen(false)
      setNotice('Foliovio Pro activado 30 días en esta cuenta (solo entorno local).')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo activar Pro.')
    }
  }

  const handleImportFile = useCallback(
    async (file: File) => {
      setImporting(true)
      setError(null)
      setNotice(null)
      try {
        const { importCvFile } = await import('./import/importFile')
        const result = await importCvFile(file)
        importData(result.data)
        setNotice(MESSAGES[result.confidence])
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo importar el archivo.')
      } finally {
        setImporting(false)
      }
    },
    [importData],
  )

  return (
    <div
      className="app-shell"
      onDragOver={(event) => {
        event.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        setDragOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragOver(false)
        const file = event.dataTransfer.files[0]
        if (file) void handleImportFile(file)
      }}
    >
      <TopBar
        exporting={exporting}
        importing={importing}
        user={user}
        onExport={() => void handleExport()}
        onUnlock={() => (user ? setPaywallOpen(true) : setAuthOpen(true))}
        onAuth={() => setAuthOpen(true)}
        loadingAccount={loading}
        onLogout={logout}
        onImportFile={(file) => void handleImportFile(file)}
      />
      {error ? (
        <p className="app-chrome bg-clay/10 px-4 py-2 text-center text-sm text-clay-dark">{error}</p>
      ) : null}
      {notice ? (
        <p className="app-chrome bg-ink/5 px-4 py-2 text-center text-sm text-ink/70">{notice}</p>
      ) : null}
      <div className="workspace">
        <aside className="editor-panel">
          <Editor />
        </aside>
        <main className="min-h-0 h-full overflow-hidden">
          <Preview pageRef={pageRef} />
        </main>
      </div>
      {exporting ? (
        <div className="app-chrome pointer-events-none fixed inset-0 z-50 grid place-items-center bg-paper/80 backdrop-blur-[2px]">
          <p className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">Elige Guardar como PDF…</p>
        </div>
      ) : null}
      <PaddleStatus />
      {authOpen && <AuthModal
        initialMode={authMode}
        open={authOpen}
        onClose={() => {
          setAuthOpen(false)
          setAuthMode('login')
          setPendingExport(false)
        }}
        onSuccess={handleAuthSuccess}
      />}
      {verificationToken !== null && <EmailVerification
        token={verificationToken}
        onClose={() => setVerificationToken(null)}
        onLogin={() => { setVerificationToken(null); setAuthMode('login'); setAuthOpen(true) }}
        onResend={() => { setVerificationToken(null); setAuthMode('resend'); setAuthOpen(true) }}
      />}
      {paywallOpen ? (
        <Paywall
          open={paywallOpen}
          email={user?.email}
          onClose={() => setPaywallOpen(false)}
          onAuth={() => { setPaywallOpen(false); setAuthOpen(true) }}
          onUnlockLocal={import.meta.env.DEV ? () => void handleUnlockLocal() : undefined}
        />
      ) : null}
      {dragOver ? (
        <div className="app-chrome pointer-events-none fixed inset-0 z-40 grid place-items-center bg-ink/35 backdrop-blur-sm">
          <div className="rounded-3xl bg-paper px-10 py-8 text-center shadow-xl">
            <p className="font-serif text-2xl tracking-tight">Suelta tu currículum</p>
            <p className="mt-1 text-sm text-ink/55">PDF, Word (.docx) o texto</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
