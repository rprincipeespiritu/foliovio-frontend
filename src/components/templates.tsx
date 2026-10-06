import { bullets, dateRange, initials, splitItems } from '../lib'
import type { CVData } from '../types'

function Photo({ src, name, className, fallbackClass }: { src: string | null; name: string; className: string; fallbackClass: string }) {
  if (src) return <img src={src} alt={name} className={className} />
  return <div className={fallbackClass}>{initials(name) || 'CV'}</div>
}

function SectionTitle({ children, className = 'cv-section-title' }: { children: string; className?: string }) {
  return <h2 className={className}>{children}</h2>
}

export function TemplateNoir({ data }: { data: CVData }) {
  const { personal, experience, education, skills, languages, projects } = data

  return (
    <div className="noir cv-mono cv-inner">
      <div className="noir-rail" aria-hidden="true" />
      <aside className="noir-side">
        <Photo src={personal.photo} name={personal.fullName} className="noir-photo" fallbackClass="noir-mono cv-outfit" />
        <p className="noir-kicker">Currículum</p>

        <h2>Contacto</h2>
        <div className="noir-contact">
          {personal.email ? <p>{personal.email}</p> : null}
          {personal.phone ? <p>{personal.phone}</p> : null}
          {personal.location ? <p>{personal.location}</p> : null}
          {personal.website ? <p>{personal.website}</p> : null}
          {personal.linkedin ? <p>{personal.linkedin}</p> : null}
        </div>

        {skills.length > 0 ? (
          <>
            <h2>Habilidades</h2>
            {skills.map((group) => (
              <div key={group.id} className="cv-keep">
                {group.name ? <p className="noir-skill-name">{group.name}</p> : null}
                <p className="noir-skill-items">{splitItems(group.items).join(' · ')}</p>
              </div>
            ))}
          </>
        ) : null}

        {languages.length > 0 ? (
          <>
            <h2>Idiomas</h2>
            <div className="noir-lang">
              {languages.map((lang) => (
                <p key={lang.id} className="cv-keep">
                  {lang.name}
                  {lang.level ? ` · ${lang.level}` : ''}
                </p>
              ))}
            </div>
          </>
        ) : null}
      </aside>

      <div className="noir-main">
        <h1 className="noir-name cv-outfit">{personal.fullName || 'Tu nombre'}</h1>
        {personal.title ? <p className="noir-title">{personal.title}</p> : null}
        {personal.summary ? <p className="cv-muted" style={{ margin: '0 0 22px' }}>{personal.summary}</p> : null}

        {experience.some((job) => job.role || job.company || job.description) ? (
          <section style={{ marginBottom: 22 }}>
            <SectionTitle>Experiencia</SectionTitle>
            {experience.filter((job) => job.role || job.company || job.description).map((job) => (
              <article key={job.id} style={{ marginBottom: 14 }}>
                <div className="cv-job-head">
                  <p className="cv-job-role">{job.role || job.company}</p>
                  <span className="cv-muted" style={{ fontSize: 12 }}>
                    {dateRange(job.startDate, job.endDate, job.current)}
                  </span>
                </div>
                <p className="cv-job-meta">
                  {[job.company, job.location].filter(Boolean).join(' · ')}
                </p>
                {bullets(job.description).length > 0 ? (
                  <ul className="cv-bullets">
                    {bullets(job.description).map((line, index) => (
                      <li key={`${job.id}-${index}`}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}

        {education.length > 0 ? (
          <section style={{ marginBottom: 22 }}>
            <SectionTitle>Formación</SectionTitle>
            {education.map((item) => (
              <article key={item.id} style={{ marginBottom: 10 }}>
                <div className="cv-job-head">
                  <p className="cv-job-role">{item.degree || item.school}</p>
                  <span className="cv-muted" style={{ fontSize: 12 }}>
                    {dateRange(item.startDate, item.endDate, false)}
                  </span>
                </div>
                <p className="cv-job-meta">
                  {[item.school, item.location].filter(Boolean).join(' · ')}
                </p>
                {item.details ? <p className="cv-muted" style={{ margin: '4px 0 0' }}>{item.details}</p> : null}
              </article>
            ))}
          </section>
        ) : null}

        {projects.length > 0 ? (
          <section>
            <SectionTitle>Proyectos</SectionTitle>
            {projects.map((project) => (
              <article key={project.id} style={{ marginBottom: 8 }}>
                <p className="cv-job-role">
                  {project.name}
                  {project.link ? <span className="cv-muted"> · {project.link}</span> : null}
                </p>
                {project.description ? <p className="cv-muted" style={{ margin: '3px 0 0' }}>{project.description}</p> : null}
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  )
}

export function TemplateLumen({ data }: { data: CVData }) {
  const { personal, experience, education, skills, languages, projects } = data

  return (
    <div className="lumen cv-mono cv-inner">
      <div className="lumen-bar" />
      <header className="lumen-top">
        <div>
          <h1 className="lumen-name cv-outfit">{personal.fullName || 'Tu nombre'}</h1>
          {personal.title ? <p className="lumen-role">{personal.title}</p> : null}
        </div>
        <Photo src={personal.photo} name={personal.fullName} className="lumen-photo" fallbackClass="lumen-mono cv-outfit" />
      </header>

      <div className="lumen-grid">
        <div className="lumen-main">
          {personal.summary ? (
            <section style={{ marginBottom: 22 }}>
              <SectionTitle>Perfil</SectionTitle>
              <p className="cv-muted" style={{ margin: 0 }}>{personal.summary}</p>
            </section>
          ) : null}

          {experience.some((job) => job.role || job.company || job.description) ? (
            <section style={{ marginBottom: 22 }}>
              <SectionTitle>Experiencia</SectionTitle>
              {experience.filter((job) => job.role || job.company || job.description).map((job) => (
                <article key={job.id} style={{ marginBottom: 14 }}>
                  <div className="cv-job-head">
                    <p className="cv-job-role">{job.role || job.company}</p>
                    <span className="cv-muted" style={{ fontSize: 12 }}>
                      {dateRange(job.startDate, job.endDate, job.current)}
                    </span>
                  </div>
                  <p className="cv-job-meta">{[job.company, job.location].filter(Boolean).join(' · ')}</p>
                  {bullets(job.description).length > 0 ? (
                    <ul className="cv-bullets">
                      {bullets(job.description).map((line, index) => (
                        <li key={`${job.id}-${index}`}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </section>
          ) : null}

          {education.length > 0 ? (
            <section>
              <SectionTitle>Formación</SectionTitle>
              {education.map((item) => (
                <article key={item.id} style={{ marginBottom: 10 }}>
                  <div className="cv-job-head">
                    <p className="cv-job-role">{item.degree || item.school}</p>
                    <span className="cv-muted" style={{ fontSize: 12 }}>
                      {dateRange(item.startDate, item.endDate, false)}
                    </span>
                  </div>
                  <p className="cv-job-meta">{[item.school, item.location].filter(Boolean).join(' · ')}</p>
                  {item.details ? <p className="cv-muted" style={{ margin: '4px 0 0' }}>{item.details}</p> : null}
                </article>
              ))}
            </section>
          ) : null}
        </div>

        <aside className="lumen-aside">
          <section style={{ marginBottom: 22 }}>
            <SectionTitle>Contacto</SectionTitle>
            <div className="lumen-contact">
              {personal.email ? <p>{personal.email}</p> : null}
              {personal.phone ? <p>{personal.phone}</p> : null}
              {personal.location ? <p>{personal.location}</p> : null}
              {personal.website ? <p>{personal.website}</p> : null}
              {personal.linkedin ? <p>{personal.linkedin}</p> : null}
            </div>
          </section>

          {skills.length > 0 ? (
            <section style={{ marginBottom: 22 }}>
              <SectionTitle>Habilidades</SectionTitle>
              {skills.map((group) => (
                <div key={group.id} style={{ marginBottom: 10 }}>
                  {group.name ? <p className="cv-job-role">{group.name}</p> : null}
                  <p className="cv-muted" style={{ margin: '3px 0 0' }}>{splitItems(group.items).join(' · ')}</p>
                </div>
              ))}
            </section>
          ) : null}

          {languages.length > 0 ? (
            <section style={{ marginBottom: 22 }}>
              <SectionTitle>Idiomas</SectionTitle>
              {languages.map((lang) => (
                <p key={lang.id} className="cv-muted" style={{ margin: '0 0 6px' }}>
                  <strong style={{ color: '#1a1614' }}>{lang.name}</strong>
                  {lang.level ? ` · ${lang.level}` : ''}
                </p>
              ))}
            </section>
          ) : null}

          {projects.length > 0 ? (
            <section>
              <SectionTitle>Proyectos</SectionTitle>
              {projects.map((project) => (
                <div key={project.id} style={{ marginBottom: 8 }}>
                  <p className="cv-job-role">{project.name}</p>
                  {project.description ? <p className="cv-muted" style={{ margin: '3px 0 0' }}>{project.description}</p> : null}
                </div>
              ))}
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

export function TemplateEditorial({ data }: { data: CVData }) {
  const { personal, experience, education, skills, languages, projects } = data
  const contact = [personal.email, personal.phone, personal.location, personal.website, personal.linkedin].filter(Boolean)

  return (
    <div className="editorial cv-news cv-inner">
      <header>
        <h1 className="editorial-name cv-fraunces">{personal.fullName || 'Tu nombre'}</h1>
        {personal.title ? <p className="editorial-role">{personal.title}</p> : null}
        <div className="editorial-rule" />
        <div className="editorial-rule-thin" />
        {contact.length > 0 ? (
          <div className="editorial-contact cv-mono">
            {contact.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
      </header>

      {personal.summary ? (
        <p className="cv-muted" style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.45 }}>
          {personal.summary}
        </p>
      ) : null}

      {experience.some((job) => job.role || job.company || job.description) ? (
        <section style={{ marginBottom: 22 }}>
          <SectionTitle>Experiencia</SectionTitle>
          {experience.filter((job) => job.role || job.company || job.description).map((job) => (
            <article key={job.id} className="editorial-row">
              <div className="editorial-year cv-mono">{dateRange(job.startDate, job.endDate, job.current)}</div>
              <div>
                <p className="cv-job-role">{job.role || job.company}</p>
                <p className="cv-job-meta">{[job.company, job.location].filter(Boolean).join(' · ')}</p>
                {bullets(job.description).length > 0 ? (
                  <ul className="cv-bullets">
                    {bullets(job.description).map((line, index) => (
                      <li key={`${job.id}-${index}`}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {education.length > 0 ? (
        <section style={{ marginBottom: 22 }}>
          <SectionTitle>Formación</SectionTitle>
          {education.map((item) => (
            <article key={item.id} className="editorial-row">
              <div className="editorial-year cv-mono">{dateRange(item.startDate, item.endDate, false)}</div>
              <div>
                <p className="cv-job-role">{item.degree || item.school}</p>
                <p className="cv-job-meta">{[item.school, item.location].filter(Boolean).join(' · ')}</p>
                {item.details ? <p className="cv-muted" style={{ margin: '4px 0 0' }}>{item.details}</p> : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <div style={{ display: 'flex', gap: 36 }}>
        {skills.length > 0 ? (
          <section style={{ flex: 1 }}>
            <SectionTitle>Habilidades</SectionTitle>
            {skills.map((group) => (
              <p key={group.id} style={{ margin: '0 0 8px' }}>
                <strong>{group.name ? `${group.name}: ` : ''}</strong>
                <span className="cv-muted">{splitItems(group.items).join(', ')}</span>
              </p>
            ))}
          </section>
        ) : null}
        {languages.length > 0 ? (
          <section style={{ width: 180 }}>
            <SectionTitle>Idiomas</SectionTitle>
            {languages.map((lang) => (
              <p key={lang.id} style={{ margin: '0 0 6px' }}>
                {lang.name}
                {lang.level ? <span className="cv-muted"> · {lang.level}</span> : null}
              </p>
            ))}
          </section>
        ) : null}
      </div>

      {projects.length > 0 ? (
        <section style={{ marginTop: 18 }}>
          <SectionTitle>Proyectos</SectionTitle>
          {projects.map((project) => (
            <p key={project.id} style={{ margin: '0 0 6px' }}>
              <strong>{project.name}</strong>
              {project.description ? <span className="cv-muted"> — {project.description}</span> : null}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  )
}
