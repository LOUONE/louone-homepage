import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import Dither from '../components/dither'
import CopyEmail from '../components/copy-email'
import { Reveal, Terminal } from '../components/card'
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
      timeZone: profile.timeZone
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="clock" suppressHydrationWarning>
      {time ?? '--:--'}
    </span>
  )
}

const Hero = () => (
  <section className="hero">
    <Dither src={paintings.hero.src} cell={6} radius={170} text={profile.name} textTop={84} dissolve />
    <h1 className="sr-only">{profile.name}</h1>
    <div className="container hero-bottom">
      <Reveal delay={0.6}>
        <p className="hero-lede">
          <strong>I work on cyber and AI at EY in Geneva, and I write a lot of code.</strong>{' '}
          At work I build AI tools for our cyber practice and help modernise how consulting
          gets done. After hours I ship software: a phishing classifier, trading systems
          running 24/7.
        </p>
      </Reveal>
      <Reveal delay={0.75} className="hero-side">
        <nav className="hero-links" aria-label="Elsewhere">
          <Link href="/#work" className="link">
            Work ↓
          </Link>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="link">
            LinkedIn ↗
          </a>
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="link">
            GitHub ↗
          </a>
        </nav>
        <p className="cartel">
          {paintings.hero.caption}. Geneva, <LocalTime />.{' '}
          <em>Move your cursor to clean the canvas.</em>
        </p>
      </Reveal>
    </div>
  </section>
)

const Statement = () => (
  <section className="container statement">
    <Reveal as="p">
      <b>Consultant at EY Switzerland,</b> on cybersecurity and AI.{' '}
      <b>Before that:</b> two summers at EY Montréal, a SOC at Genetec and a computer
      science degree at the Université de Montréal. <b>I like problems that end with
      something running.</b>
    </Reveal>
  </section>
)

const Block = ({ id, title, note, children }) => (
  <section id={id} className="container">
    <div className="block">
      <Reveal className="block-head">
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </Reveal>
      <div>{children}</div>
    </div>
  </section>
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
        <span className="row-title">{p.title}</span>
        <span className="row-meta">
          {p.kind}, {p.year}
          <span className="row-toggle" aria-hidden>
            +
          </span>
        </span>
        <span className="row-summary">{p.summary}</span>
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
              <ul className="dash">
                {p.details.map(d => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="stack">{p.stack.join(', ')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

const Work = () => (
  <Block id="work" title="Work" note="Things I build on my own time. The day job is under Experience.">
    <Reveal className="feature">
      <div>
        <p className="feature-meta">
          {mailguard.kind}, {mailguard.year}
        </p>
        <h3>{mailguard.title}</h3>
        <p>{mailguard.tagline}</p>
        <p className="stack">{mailguard.stack.join(', ')}</p>
        <div className="feature-links">
          <Link href={`/work/${mailguard.slug}`} className="link">
            Read the case study →
          </Link>
          <a href={mailguard.repo} target="_blank" rel="noreferrer" className="link">
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
    </Reveal>

    <Reveal className="numbers">
      {mailguard.stats.map(s => (
        <div key={s.label}>
          <b>{s.value}</b>
          <span>{s.label}</span>
        </div>
      ))}
    </Reveal>

    <Reveal as="ul" className="rows">
      {projects.map(p => (
        <ProjectRow key={p.title} p={p} />
      ))}
    </Reveal>
  </Block>
)

const Experience = () => (
  <Block id="experience" title="Experience">
    <ul className="jobs">
      {experience.map(job => (
        <Reveal as="li" key={job.company + job.period} className="job">
          <div className="job-head">
            <h3>{job.company}</h3>
            <span className="job-when">
              {job.place}, {job.current ? <span className="now">{job.period}</span> : job.period}
            </span>
          </div>
          <p className="job-role">{job.role}</p>
          <ul className="dash">
            {job.points.map(pt => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </Reveal>
      ))}
    </ul>
  </Block>
)

const Toolkit = () => (
  <Block id="toolkit" title="Toolkit">
    <Reveal className="columns">
      {toolkit.map(g => (
        <div key={g.group}>
          <h3>{g.group}</h3>
          <ul>
            {g.items.map(i => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ))}
    </Reveal>
  </Block>
)

const Education = () => (
  <Block id="education" title="Education">
    <Reveal className="columns">
      <div>
        <h3>{education.period}</h3>
        <p>
          <strong>{education.degree}</strong>
          {education.school}
        </p>
        <ul>
          {education.notes.map(n => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Certification</h3>
        {certifications.map(c => (
          <p key={c.name}>
            <strong>{c.name}</strong>
            {c.detail}
          </p>
        ))}
      </div>
      <div>
        <h3>Languages</h3>
        <ul>
          {languages.map(l => (
            <li key={l.name}>
              {l.name}, {l.level}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  </Block>
)

const Contact = () => (
  <section id="contact">
    <div className="band">
      <Dither src={paintings.dusk.src} cell={6} radius={150} text="Get in touch" textCenter />
    </div>
    <div className="container contact">
      <Reveal as="p" className="contact-mail">
        <CopyEmail />
      </Reveal>
      <Reveal className="contact-row">
        <span>Click the address to copy it. Based in Geneva.</span>
        <nav>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="link">
            LinkedIn ↗
          </a>
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="link">
            GitHub ↗
          </a>
        </nav>
      </Reveal>
    </div>
  </section>
)

export default function Home() {
  return (
    <>
      <Head>
        <title>Louis Forrer · Cyber, AI & software, Geneva</title>
      </Head>
      <Hero />
      <Statement />
      <Work />
      <Experience />
      <Toolkit />
      <Education />
      <Contact />
    </>
  )
}
