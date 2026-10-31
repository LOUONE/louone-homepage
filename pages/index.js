import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import Dither from '../components/dither'
import CopyEmail from '../components/copy-email'
import { Card, Reveal, Terminal } from '../components/card'
import {
  profile,
  paintings,
  mailguard,
  projects,
  experience,
  toolkit,
  education,
  certifications,
  languages
} from '../lib/data'

const LocalTime = () => {
  const [time, setTime] = useState(null)

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: profile.timeZone,
      timeZoneName: 'short'
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  return <span suppressHydrationWarning>{time ?? '--:--'}</span>
}

const Hero = () => (
  <section className="hero">
    <Dither src={paintings.hero.src} cell={6} radius={170} />
    <div className="container hero-inner">
      <Reveal className="hero-card" delay={0.3}>
        <div className="hero-meta label">
          <span className="live">{profile.location}</span>
          <LocalTime />
        </div>
        <h1>
          Louis <em>Forrer</em>
        </h1>
        <p className="hero-lede">
          <strong>Cybersecurity consultant at EY in Geneva.</strong> I do forensics
          and audits for Swiss banks, and I&apos;m part of the AI innovation push in our tech
          consulting: trainings, new tools, and modernising how the job is done.
        </p>
        <div className="actions">
          <Link href="/#work" className="btn btn-light">
            See my work <span className="arrow">↓</span>
          </Link>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="btn">
            LinkedIn ↗
          </a>
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="btn">
            GitHub ↗
          </a>
        </div>
      </Reveal>
    </div>
    <p className="cartel">
      {paintings.hero.caption}
      <span>move your cursor to restore it</span>
    </p>
  </section>
)

const Facts = () => (
  <div className="container">
    <Reveal as="dl" className="facts">
      <div>
        <dt>Now</dt>
        <dd>EY Switzerland, cybersecurity and AI innovation</dd>
      </div>
      <div>
        <dt>Before</dt>
        <dd>EY Montréal, Genetec SOC</dd>
      </div>
      <div>
        <dt>Studied</dt>
        <dd>BSc Computer Science, Université de Montréal</dd>
      </div>
      <div>
        <dt>Speaks</dt>
        <dd>French, English, some German</dd>
      </div>
    </Reveal>
  </div>
)

const SectionHead = ({ n, label, children }) => (
  <Reveal className="section-head">
    <span className="label">
      <b>{n}</b> {label}
    </span>
    <h2 className="section-title">{children}</h2>
  </Reveal>
)

const ProjectRow = ({ p }) => {
  const [open, setOpen] = useState(false)
  const id = `project-${p.title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <li>
      <button
        className="row-btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
      >
        <span className="row-year">
          {p.year}
          <br />
          {p.kind}
        </span>
        <span>
          <span className="row-title">{p.title}</span>
          <span className="row-summary">{p.summary}</span>
        </span>
        <span className="row-toggle" aria-hidden>
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="row-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="row-body-inner">
              <span />
              <div>
                <ul>
                  {p.details.map(d => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <div className="chips">
                  {p.stack.map(s => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

const Work = () => (
  <section id="work" className="section container">
    <SectionHead n="01" label="Work">
      Things I build <em>after hours</em>
    </SectionHead>

    <Reveal>
      <Card className="feature">
        <div className="feature-copy">
          <div className="feature-meta">
            <span className="badge">Latest</span>
            <span className="label">
              {mailguard.year} · {mailguard.kind}
            </span>
          </div>
          <h3>{mailguard.title}</h3>
          <p>{mailguard.tagline}</p>
          <div className="chips">
            {mailguard.stack.map(t => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <div className="feature-links">
            <Link href={`/work/${mailguard.slug}`} className="btn btn-light">
              Read the case study <span className="arrow">→</span>
            </Link>
            <a href={mailguard.repo} target="_blank" rel="noreferrer" className="btn">
              Source ↗
            </a>
          </div>
        </div>
        <Terminal title="mailguard — ./score.sh">
          <Image
            src="/images/work/mailguard/demo.gif"
            alt="A terminal scores two made-up emails with the mailguard API: a PayPal lure is labelled phishing, a colleague's reply is labelled legitimate."
            width={1100}
            height={720}
            unoptimized
          />
        </Terminal>
      </Card>
    </Reveal>

    <Reveal className="stats">
      {mailguard.stats.map(s => (
        <div key={s.label} className="stat">
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </Reveal>

    <Reveal as="ul" className="rows">
      {projects.map(p => (
        <ProjectRow key={p.title} p={p} />
      ))}
    </Reveal>
  </section>
)

const Experience = () => (
  <section id="experience" className="section container">
    <SectionHead n="02" label="Experience">
      Banks, audits and <em>a SOC</em>
    </SectionHead>
    <ul className="jobs">
      {experience.map(job => (
        <Reveal as="li" key={job.company + job.period} className="job">
          <div className="job-when">
            <b>{job.company}</b>
            {job.place}
            <br />
            {job.period}
            {job.current && (
              <>
                <br />
                <span className="badge job-now">Current</span>
              </>
            )}
          </div>
          <div>
            <h3>{job.role}</h3>
            <ul>
              {job.points.map(pt => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </ul>
  </section>
)

const Toolkit = () => (
  <section id="toolkit" className="section container">
    <SectionHead n="03" label="Toolkit">
      What I work with
    </SectionHead>
    <Reveal className="toolkit">
      {toolkit.map(g => (
        <div key={g.group} className="tool-group">
          <span className="label">{g.group}</span>
          <ul>
            {g.items.map(i => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ))}
    </Reveal>
  </section>
)

const Education = () => (
  <section className="section container" style={{ paddingTop: 0 }}>
    <SectionHead n="04" label="Education">
      School and paper
    </SectionHead>
    <div className="edu">
      <Reveal>
        <Card style={{ height: '100%' }}>
          <span className="label">{education.period}</span>
          <h3>{education.degree}</h3>
          <p>{education.school}</p>
          <ul>
            {education.notes.map(n => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Card>
      </Reveal>
      <Reveal delay={0.05}>
        <Card style={{ height: '100%' }}>
          <span className="label">Certification</span>
          {certifications.map(c => (
            <div key={c.name}>
              <h3>{c.name}</h3>
              <p>{c.detail}</p>
            </div>
          ))}
        </Card>
      </Reveal>
      <Reveal delay={0.1}>
        <Card style={{ height: '100%' }}>
          <span className="label">Languages</span>
          <ul>
            {languages.map(l => (
              <li key={l.name}>
                {l.name} <span>{l.level}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </div>
  </section>
)

const Contact = () => (
  <section id="contact" className="contact">
    <Dither src={paintings.dusk.src} cell={7} radius={150} />
    <div className="container">
      <Reveal className="hero-card">
        <span className="label">
          <b>05</b> Contact
        </span>
        <h2>Say hello</h2>
        <p>The quickest way to reach me is email. Click to copy it.</p>
        <div className="actions">
          <CopyEmail className="btn btn-light" />
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="btn">
            LinkedIn ↗
          </a>
        </div>
      </Reveal>
    </div>
  </section>
)

export default function Home() {
  return (
    <>
      <Head>
        <title>Louis Forrer · Cybersecurity, Geneva</title>
      </Head>
      <Hero />
      <Facts />
      <Work />
      <Experience />
      <Toolkit />
      <Education />
      <Contact />
    </>
  )
}
