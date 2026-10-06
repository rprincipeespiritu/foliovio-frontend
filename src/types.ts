export type TemplateId = 'noir' | 'lumen' | 'editorial'

export interface PersonalInfo {
  fullName: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  photo: string | null
  summary: string
}

export interface ExperienceItem {
  id: string
  company: string
  role: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface EducationItem {
  id: string
  school: string
  degree: string
  location: string
  startDate: string
  endDate: string
  details: string
}

export interface SkillGroup {
  id: string
  name: string
  items: string
}

export interface LanguageItem {
  id: string
  name: string
  level: string
}

export interface ProjectItem {
  id: string
  name: string
  link: string
  description: string
}

export interface CVData {
  personal: PersonalInfo
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillGroup[]
  languages: LanguageItem[]
  projects: ProjectItem[]
}

export interface CVSettings {
  template: TemplateId
  accent: string
}

export interface AccentOption {
  id: string
  value: string
  label: string
}

export const ACCENTS: AccentOption[] = [
  { id: 'ink', value: '#1a1614', label: 'Tinta' },
  { id: 'teal', value: '#0f5c57', label: 'Teal' },
  { id: 'navy', value: '#1d3557', label: 'Navy' },
  { id: 'burgundy', value: '#6b2b2b', label: 'Burdeos' },
  { id: 'forest', value: '#1f4d32', label: 'Bosque' },
  { id: 'ochre', value: '#9a4a12', label: 'Ocre' },
]

export const TEMPLATES: { id: TemplateId; name: string; hint: string }[] = [
  { id: 'noir', name: 'Noir', hint: 'Barra lateral' },
  { id: 'lumen', name: 'Lumen', hint: 'Clara y aérea' },
  { id: 'editorial', name: 'Editorial', hint: 'Revista' },
]
