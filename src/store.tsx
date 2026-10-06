import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { uid } from './lib'
import { defaultSettings, emptyCV, sampleCV } from './sample'
import type {
  CVData,
  CVSettings,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PersonalInfo,
  ProjectItem,
  SkillGroup,
} from './types'

const STORAGE_KEY = 'vita-cv-v1'

interface StoredState {
  data: CVData
  settings: CVSettings
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { data: sampleCV, settings: defaultSettings }
    const parsed = JSON.parse(raw) as StoredState
    return {
      data: { ...emptyCV(), ...parsed.data, personal: { ...emptyCV().personal, ...parsed.data?.personal } },
      settings: { ...defaultSettings, ...parsed.settings },
    }
  } catch {
    return { data: sampleCV, settings: defaultSettings }
  }
}

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction
  if (next < 0 || next >= list.length) return list
  const copy = [...list]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

interface CVContextValue {
  data: CVData
  settings: CVSettings
  updatePersonal: (patch: Partial<PersonalInfo>) => void
  updateSettings: (patch: Partial<CVSettings>) => void
  addExperience: () => void
  updateExperience: (id: string, patch: Partial<ExperienceItem>) => void
  removeExperience: (id: string) => void
  moveExperience: (index: number, direction: -1 | 1) => void
  addEducation: () => void
  updateEducation: (id: string, patch: Partial<EducationItem>) => void
  removeEducation: (id: string) => void
  moveEducation: (index: number, direction: -1 | 1) => void
  addSkill: () => void
  updateSkill: (id: string, patch: Partial<SkillGroup>) => void
  removeSkill: (id: string) => void
  moveSkill: (index: number, direction: -1 | 1) => void
  addLanguage: () => void
  updateLanguage: (id: string, patch: Partial<LanguageItem>) => void
  removeLanguage: (id: string) => void
  moveLanguage: (index: number, direction: -1 | 1) => void
  addProject: () => void
  updateProject: (id: string, patch: Partial<ProjectItem>) => void
  removeProject: (id: string) => void
  moveProject: (index: number, direction: -1 | 1) => void
  loadSample: () => void
  clearAll: () => void
  importData: (next: CVData) => void
}

const CVContext = createContext<CVContextValue | null>(null)

export function CVProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CVData>(() => loadState().data)
  const [settings, setSettings] = useState<CVSettings>(() => loadState().settings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, settings }))
  }, [data, settings])

  const updatePersonal = useCallback((patch: Partial<PersonalInfo>) => {
    setData((prev) => ({ ...prev, personal: { ...prev.personal, ...patch } }))
  }, [])

  const updateSettings = useCallback((patch: Partial<CVSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo<CVContextValue>(
    () => ({
      data,
      settings,
      updatePersonal,
      updateSettings,
      addExperience: () =>
        setData((prev) => ({
          ...prev,
          experience: [
            ...prev.experience,
            {
              id: uid(),
              company: '',
              role: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: '',
            },
          ],
        })),
      updateExperience: (id, patch) =>
        setData((prev) => ({
          ...prev,
          experience: prev.experience.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeExperience: (id) =>
        setData((prev) => ({ ...prev, experience: prev.experience.filter((item) => item.id !== id) })),
      moveExperience: (index, direction) =>
        setData((prev) => ({ ...prev, experience: moveItem(prev.experience, index, direction) })),
      addEducation: () =>
        setData((prev) => ({
          ...prev,
          education: [
            ...prev.education,
            {
              id: uid(),
              school: '',
              degree: '',
              location: '',
              startDate: '',
              endDate: '',
              details: '',
            },
          ],
        })),
      updateEducation: (id, patch) =>
        setData((prev) => ({
          ...prev,
          education: prev.education.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeEducation: (id) =>
        setData((prev) => ({ ...prev, education: prev.education.filter((item) => item.id !== id) })),
      moveEducation: (index, direction) =>
        setData((prev) => ({ ...prev, education: moveItem(prev.education, index, direction) })),
      addSkill: () =>
        setData((prev) => ({
          ...prev,
          skills: [...prev.skills, { id: uid(), name: '', items: '' }],
        })),
      updateSkill: (id, patch) =>
        setData((prev) => ({
          ...prev,
          skills: prev.skills.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeSkill: (id) =>
        setData((prev) => ({ ...prev, skills: prev.skills.filter((item) => item.id !== id) })),
      moveSkill: (index, direction) =>
        setData((prev) => ({ ...prev, skills: moveItem(prev.skills, index, direction) })),
      addLanguage: () =>
        setData((prev) => ({
          ...prev,
          languages: [...prev.languages, { id: uid(), name: '', level: '' }],
        })),
      updateLanguage: (id, patch) =>
        setData((prev) => ({
          ...prev,
          languages: prev.languages.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeLanguage: (id) =>
        setData((prev) => ({ ...prev, languages: prev.languages.filter((item) => item.id !== id) })),
      moveLanguage: (index, direction) =>
        setData((prev) => ({ ...prev, languages: moveItem(prev.languages, index, direction) })),
      addProject: () =>
        setData((prev) => ({
          ...prev,
          projects: [...prev.projects, { id: uid(), name: '', link: '', description: '' }],
        })),
      updateProject: (id, patch) =>
        setData((prev) => ({
          ...prev,
          projects: prev.projects.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeProject: (id) =>
        setData((prev) => ({ ...prev, projects: prev.projects.filter((item) => item.id !== id) })),
      moveProject: (index, direction) =>
        setData((prev) => ({ ...prev, projects: moveItem(prev.projects, index, direction) })),
      loadSample: () => {
        setData(sampleCV)
        setSettings(defaultSettings)
      },
      clearAll: () => setData(emptyCV()),
      importData: (next) => setData(next),
    }),
    [data, settings, updatePersonal, updateSettings],
  )

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>
}

export function useCV(): CVContextValue {
  const ctx = useContext(CVContext)
  if (!ctx) throw new Error('useCV debe usarse dentro de CVProvider')
  return ctx
}
