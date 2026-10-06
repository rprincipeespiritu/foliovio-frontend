import type { CVData, CVSettings } from './types'

export const defaultSettings: CVSettings = {
  template: 'noir',
  accent: '#1d3557',
}

export const emptyPersonal = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  photo: null as string | null,
  summary: '',
}

export const sampleCV: CVData = {
  personal: {
    fullName: 'Elena Vargas',
    title: 'Directora de Producto Digital',
    email: 'elena.vargas@email.com',
    phone: '+34 612 345 678',
    location: 'Madrid, España',
    website: 'elenavargas.design',
    linkedin: 'linkedin.com/in/elenavargas',
    photo: null,
    summary:
      'Lidero equipos de producto en entornos de alta incertidumbre. Combino investigación, estrategia y diseño para lanzar productos que la gente usa de verdad.',
  },
  experience: [
    {
      id: 'e1',
      company: 'Nimbus',
      role: 'Directora de Producto',
      location: 'Madrid',
      startDate: '2022',
      endDate: '',
      current: true,
      description:
        'Lideré un equipo de 12 personas entre producto, diseño e ingeniería.\nLancé la plataforma B2B que hoy representa el 40% de los ingresos.\nDefiní el sistema de discovery y las métricas de producto de la compañía.',
    },
    {
      id: 'e2',
      company: 'Taller Norte',
      role: 'Lead Product Designer',
      location: 'Barcelona',
      startDate: '2018',
      endDate: '2022',
      current: false,
      description:
        'Rediseñé el onboarding y subí la activación un 28%.\nCreé el design system usado por cuatro squads.\nMentoricé diseñadoras junior y coordiné research cualitativo.',
    },
    {
      id: 'e3',
      company: 'Estudio Alba',
      role: 'Product Designer',
      location: 'Valencia',
      startDate: '2015',
      endDate: '2018',
      current: false,
      description:
        'Diseñé productos digitales para banca, cultura y educación.\nTrabajé codo a codo con ingeniería en sprints semanales.',
    },
  ],
  education: [
    {
      id: 'ed1',
      school: 'Elisava',
      degree: 'Máster en Diseño de Interacción',
      location: 'Barcelona',
      startDate: '2014',
      endDate: '2015',
      details: 'Proyecto final: sistema de orientación hospitalaria.',
    },
    {
      id: 'ed2',
      school: 'Universidad de Valencia',
      degree: 'Grado en Bellas Artes',
      location: 'Valencia',
      startDate: '2009',
      endDate: '2013',
      details: '',
    },
  ],
  skills: [
    {
      id: 's1',
      name: 'Producto',
      items: 'Discovery, Roadmapping, Métricas, Go-to-market',
    },
    {
      id: 's2',
      name: 'Diseño',
      items: 'Figma, Design systems, Research, Prototipado',
    },
    {
      id: 's3',
      name: 'Liderazgo',
      items: 'Mentoría, Hiring, Facilitación, Stakeholders',
    },
  ],
  languages: [
    { id: 'l1', name: 'Español', level: 'Nativo' },
    { id: 'l2', name: 'Inglés', level: 'C1' },
    { id: 'l3', name: 'Francés', level: 'B1' },
  ],
  projects: [
    {
      id: 'p1',
      name: 'Atlas DS',
      link: '',
      description: 'Design system open source para productos B2B.',
    },
  ],
}

export function emptyCV(): CVData {
  return {
    personal: { ...emptyPersonal },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
  }
}
