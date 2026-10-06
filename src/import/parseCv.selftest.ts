import { OLD_CV_FIXTURE } from './fixtures'
import { parseCvText } from './parseCv'

const cv = parseCvText(OLD_CV_FIXTURE)
const errors: string[] = []

function expect(label: string, actual: unknown, predicted: unknown) {
  if (actual !== predicted) errors.push(`${label}: expected ${JSON.stringify(predicted)}, got ${JSON.stringify(actual)}`)
}

expect('name', cv.personal.fullName, 'Carlos Méndez Ruiz')
expect('title', cv.personal.title, 'Ingeniero de Software')
expect('email', cv.personal.email, 'carlos.mendez@email.com')
expect('jobs', cv.experience.length, 3)
expect('first role', cv.experience[0]?.role, 'Lead Developer')
expect('first company', cv.experience[0]?.company, 'Nimbus')
expect('first location', cv.experience[0]?.location, 'Madrid')
expect('first current', cv.experience[0]?.current, true)
expect('second role', cv.experience[1]?.role, 'Desarrollador Senior')
expect('second company', cv.experience[1]?.company, 'Taller Norte')
expect('third role', cv.experience[2]?.role, 'Full Stack Developer')
expect('education', cv.education.length, 2)
expect('skills groups', cv.skills.length >= 2, true)
expect('languages', cv.languages.length, 3)
expect('projects', cv.projects[0]?.name, 'Atlas DS')

if (errors.length) {
  console.error(cv)
  throw new Error(errors.join('\n'))
}

console.log('parseCv ok', {
  name: cv.personal.fullName,
  jobs: cv.experience.map((job) => `${job.role} @ ${job.company}`),
  education: cv.education.map((item) => item.degree),
})
