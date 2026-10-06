import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from 'lucide-react'
import { useState, type ChangeEvent, type ReactNode } from 'react'
import { readAndResizeImage } from '../lib'
import { useCV } from '../store'

const inputClass = 'input'
const areaClass = 'input textarea'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">
        {label}
      </span>
      {children}
    </label>
  )
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="border-b border-ink/8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="font-semibold tracking-tight">{title}</span>
        {open ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
      </button>
      {open ? <div className="space-y-3 px-5 pb-5">{children}</div> : null}
    </section>
  )
}

function ItemBar({
  onUp,
  onDown,
  onRemove,
}: {
  onUp: () => void
  onDown: () => void
  onRemove: () => void
}) {
  return (
    <div className="mb-2 flex justify-end gap-1">
      <button type="button" className="rounded-md p-1 text-ink/45 hover:bg-ink/5" onClick={onUp} aria-label="Subir">
        <ChevronUp size={14} />
      </button>
      <button type="button" className="rounded-md p-1 text-ink/45 hover:bg-ink/5" onClick={onDown} aria-label="Bajar">
        <ChevronDown size={14} />
      </button>
      <button type="button" className="rounded-md p-1 text-ink/45 hover:bg-red-50 hover:text-red-700" onClick={onRemove} aria-label="Eliminar">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export function Editor() {
  const cv = useCV()
  const { personal } = cv.data

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = await readAndResizeImage(file)
    cv.updatePersonal({ photo: dataUrl })
    event.target.value = ''
  }

  return (
    <div>
      <div className="px-5 py-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-clay uppercase">Editor</p>
        <h2 className="mt-1 font-serif text-2xl tracking-tight">Cuenta tu trayectoria</h2>
        <p className="mt-1 text-sm text-ink/55">
          Importa un PDF, Word o texto, o escribe aquí. Los cambios se ven al instante y se guardan en este navegador.
        </p>
      </div>

      <Section title="Perfil" defaultOpen>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-2xl bg-stone">
            {personal.photo ? (
              <img src={personal.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-ink/30">
                <Upload size={18} />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper">
              Subir foto
              <input type="file" accept="image/*" className="hidden" onChange={(event) => void onPhoto(event)} />
            </label>
            {personal.photo ? (
              <button type="button" className="block text-xs text-ink/50 hover:text-ink" onClick={() => cv.updatePersonal({ photo: null })}>
                Quitar foto
              </button>
            ) : null}
          </div>
        </div>
        <Field label="Nombre">
          <input className={inputClass} value={personal.fullName} onChange={(e) => cv.updatePersonal({ fullName: e.target.value })} />
        </Field>
        <Field label="Título profesional">
          <input className={inputClass} value={personal.title} onChange={(e) => cv.updatePersonal({ title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <input className={inputClass} value={personal.email} onChange={(e) => cv.updatePersonal({ email: e.target.value })} />
          </Field>
          <Field label="Teléfono">
            <input className={inputClass} value={personal.phone} onChange={(e) => cv.updatePersonal({ phone: e.target.value })} />
          </Field>
        </div>
        <Field label="Ubicación">
          <input className={inputClass} value={personal.location} onChange={(e) => cv.updatePersonal({ location: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Web">
            <input className={inputClass} value={personal.website} onChange={(e) => cv.updatePersonal({ website: e.target.value })} />
          </Field>
          <Field label="LinkedIn">
            <input className={inputClass} value={personal.linkedin} onChange={(e) => cv.updatePersonal({ linkedin: e.target.value })} />
          </Field>
        </div>
        <Field label="Resumen">
          <textarea className={areaClass} value={personal.summary} onChange={(e) => cv.updatePersonal({ summary: e.target.value })} />
        </Field>
      </Section>

      <Section title="Experiencia">
        {cv.data.experience.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-ink/8 bg-white/70 p-3">
            <ItemBar
              onUp={() => cv.moveExperience(index, -1)}
              onDown={() => cv.moveExperience(index, 1)}
              onRemove={() => cv.removeExperience(item.id)}
            />
            <div className="space-y-3">
              <Field label="Puesto">
                <input className={inputClass} value={item.role} onChange={(e) => cv.updateExperience(item.id, { role: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Empresa">
                  <input className={inputClass} value={item.company} onChange={(e) => cv.updateExperience(item.id, { company: e.target.value })} />
                </Field>
                <Field label="Lugar">
                  <input className={inputClass} value={item.location} onChange={(e) => cv.updateExperience(item.id, { location: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Desde">
                  <input className={inputClass} placeholder="2021" value={item.startDate} onChange={(e) => cv.updateExperience(item.id, { startDate: e.target.value })} />
                </Field>
                <Field label="Hasta">
                  <input className={inputClass} placeholder="2024" disabled={item.current} value={item.endDate} onChange={(e) => cv.updateExperience(item.id, { endDate: e.target.value })} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={item.current} onChange={(e) => cv.updateExperience(item.id, { current: e.target.checked })} />
                Trabajo actual
              </label>
              <Field label="Logros (una línea por viñeta)">
                <textarea className={areaClass} value={item.description} onChange={(e) => cv.updateExperience(item.id, { description: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
        <button type="button" onClick={cv.addExperience} className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-clay-dark">
          <Plus size={15} /> Añadir experiencia
        </button>
      </Section>

      <Section title="Formación">
        {cv.data.education.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-ink/8 bg-white/70 p-3">
            <ItemBar
              onUp={() => cv.moveEducation(index, -1)}
              onDown={() => cv.moveEducation(index, 1)}
              onRemove={() => cv.removeEducation(item.id)}
            />
            <div className="space-y-3">
              <Field label="Título">
                <input className={inputClass} value={item.degree} onChange={(e) => cv.updateEducation(item.id, { degree: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Centro">
                  <input className={inputClass} value={item.school} onChange={(e) => cv.updateEducation(item.id, { school: e.target.value })} />
                </Field>
                <Field label="Lugar">
                  <input className={inputClass} value={item.location} onChange={(e) => cv.updateEducation(item.id, { location: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Desde">
                  <input className={inputClass} value={item.startDate} onChange={(e) => cv.updateEducation(item.id, { startDate: e.target.value })} />
                </Field>
                <Field label="Hasta">
                  <input className={inputClass} value={item.endDate} onChange={(e) => cv.updateEducation(item.id, { endDate: e.target.value })} />
                </Field>
              </div>
              <Field label="Detalle">
                <input className={inputClass} value={item.details} onChange={(e) => cv.updateEducation(item.id, { details: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
        <button type="button" onClick={cv.addEducation} className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-clay-dark">
          <Plus size={15} /> Añadir formación
        </button>
      </Section>

      <Section title="Habilidades">
        {cv.data.skills.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-ink/8 bg-white/70 p-3">
            <ItemBar onUp={() => cv.moveSkill(index, -1)} onDown={() => cv.moveSkill(index, 1)} onRemove={() => cv.removeSkill(item.id)} />
            <div className="space-y-3">
              <Field label="Grupo">
                <input className={inputClass} placeholder="Diseño" value={item.name} onChange={(e) => cv.updateSkill(item.id, { name: e.target.value })} />
              </Field>
              <Field label="Habilidades (separadas por coma)">
                <input className={inputClass} value={item.items} onChange={(e) => cv.updateSkill(item.id, { items: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
        <button type="button" onClick={cv.addSkill} className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-clay-dark">
          <Plus size={15} /> Añadir grupo
        </button>
      </Section>

      <Section title="Idiomas">
        {cv.data.languages.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <Field label="Idioma">
              <input className={inputClass} value={item.name} onChange={(e) => cv.updateLanguage(item.id, { name: e.target.value })} />
            </Field>
            <Field label="Nivel">
              <input className={inputClass} placeholder="C1" value={item.level} onChange={(e) => cv.updateLanguage(item.id, { level: e.target.value })} />
            </Field>
            <div className="flex pb-1">
              <button type="button" className="rounded-md p-2 text-ink/40 hover:text-ink" onClick={() => cv.moveLanguage(index, -1)}>
                <ChevronUp size={14} />
              </button>
              <button type="button" className="rounded-md p-2 text-ink/40 hover:text-ink" onClick={() => cv.moveLanguage(index, 1)}>
                <ChevronDown size={14} />
              </button>
              <button type="button" className="rounded-md p-2 text-ink/40 hover:text-red-700" onClick={() => cv.removeLanguage(item.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={cv.addLanguage} className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-clay-dark">
          <Plus size={15} /> Añadir idioma
        </button>
      </Section>

      <Section title="Proyectos">
        {cv.data.projects.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-ink/8 bg-white/70 p-3">
            <ItemBar onUp={() => cv.moveProject(index, -1)} onDown={() => cv.moveProject(index, 1)} onRemove={() => cv.removeProject(item.id)} />
            <div className="space-y-3">
              <Field label="Nombre">
                <input className={inputClass} value={item.name} onChange={(e) => cv.updateProject(item.id, { name: e.target.value })} />
              </Field>
              <Field label="Enlace">
                <input className={inputClass} value={item.link} onChange={(e) => cv.updateProject(item.id, { link: e.target.value })} />
              </Field>
              <Field label="Descripción">
                <input className={inputClass} value={item.description} onChange={(e) => cv.updateProject(item.id, { description: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
        <button type="button" onClick={cv.addProject} className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-clay-dark">
          <Plus size={15} /> Añadir proyecto
        </button>
      </Section>
    </div>
  )
}
