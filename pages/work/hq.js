import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Dither from '../../components/dither'
import HqPhone from '../../components/hq-phone'
import { Reveal } from '../../components/card'
import { hq as project, paintings } from '../../lib/data'

const EASE = [0.22, 1, 0.36, 1]

const Block = ({ title, children }) => (
  <section className="container">
    <div className="block">
      <Reveal className="block-head">
        <h2>{title}</h2>
      </Reveal>
      <div>{children}</div>
    </div>
  </section>
)

/* ---------------------------------------------------------------- *
 * a. Architecture map
 * ---------------------------------------------------------------- */

const NODES = {
  you: {
    label: 'you',
    kind: 'Human',
    what: 'Asks for things, answers questions, approves briefs and decides what gets merged.',
    why: 'The only part of the system allowed to say yes to something that cannot be undone. Everything else proposes.'
  },
  orchestrator: {
    label: 'orchestrator',
    kind: 'Agent',
    what: 'Turns a request into a written brief, asks what is unclear and hands the work to the right agent.',
    why: 'One entry point keeps the conversation in one place. It plans and routes, but it does not write code or touch personal data itself.'
  },
  coder: {
    label: 'coder',
    kind: 'Agent',
    what: 'Works on one project at a time in a throwaway, isolated environment and delivers a pull request.',
    why: 'An isolated workspace means a bad idea costs a deleted branch, not a broken server. It can propose changes, never merge them.'
  },
  watcher: {
    label: 'watcher',
    kind: 'Agent',
    what: 'Checks on running things at set times and writes a short report when something looks off.',
    why: 'Watching needs reading, not writing. It gets read-only tools and can only write to its own report folder.'
  },
  assistant: {
    label: 'assistant',
    kind: 'Agent',
    what: 'Handles personal admin: reminders, notes about my own life, the boring paperwork.',
    why: 'The only agent with access to the private vault, and it has no coding tools. Keeping it apart limits who can ever see personal data.'
  },
  tools: {
    label: 'scoped tools',
    kind: 'Capability',
    what: 'Small, named tools that each do one thing, granted to an agent one by one.',
    why: 'An allowlist is easier to reason about than a sandbox with holes. A tool that is not granted does not exist for that agent.'
  },
  shared: {
    label: 'shared notes',
    kind: 'Storage',
    what: 'A plain-text vault of project notes, decisions and briefs that the working agents can read.',
    why: 'Shared context without shared rights: everyone can read, but each agent writes only in its own folder.'
  },
  private: {
    label: 'private vault',
    kind: 'Storage',
    what: 'A separate vault for personal data, outside the shared one.',
    why: 'Separation is enforced by where the files live, not by asking agents nicely. The other agents have no path to it.'
  }
}

const EDGES = [
  ['you', 'orchestrator'],
  ['orchestrator', 'coder'],
  ['orchestrator', 'watcher'],
  ['orchestrator', 'assistant'],
  ['coder', 'tools'],
  ['coder', 'shared'],
  ['watcher', 'shared'],
  ['assistant', 'private']
]

const LAYOUTS = {
  wide: {
    w: 860,
    h: 430,
    nw: 168,
    nh: 46,
    font: 14,
    pos: {
      you: [430, 44],
      orchestrator: [430, 140],
      coder: [170, 250],
      watcher: [430, 250],
      assistant: [690, 250],
      tools: [170, 370],
      shared: [430, 370],
      private: [690, 370]
    },
    zone: { x: 584, y: 194, w: 212, h: 224 }
  },
  narrow: {
    w: 360,
    h: 430,
    nw: 106,
    nh: 42,
    font: 12.5,
    pos: {
      you: [180, 36],
      orchestrator: [180, 128],
      coder: [62, 238],
      watcher: [180, 238],
      assistant: [298, 238],
      tools: [62, 370],
      shared: [180, 370],
      private: [298, 370]
    },
    zone: { x: 240, y: 188, w: 116, h: 226 }
  }
}

const ArchSvg = ({ layout, className, selected, onSelect }) => {
  const L = LAYOUTS[layout]
  const linked = id => EDGES.some(([a, b]) => (a === selected && b === id) || (b === selected && a === id))

  const onKey = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <svg
      className={`hq-arch ${className}`}
      viewBox={`0 0 ${L.w} ${L.h}`}
      role="group"
      aria-label="Architecture diagram. Each box is a button that explains that part of the system."
    >
      <rect
        className="hq-zone"
        x={L.zone.x}
        y={L.zone.y}
        width={L.zone.w}
        height={L.zone.h}
        rx="10"
      />
      <text className="hq-zone-label" x={L.zone.x + 10} y={L.zone.y + 15}>
        private space
      </text>

      {EDGES.map(([a, b]) => {
        const [x1, y1] = L.pos[a]
        const [x2, y2] = L.pos[b]
        const on = a === selected || b === selected
        return (
          <line
            key={a + b}
            className={`hq-edge ${on ? 'on' : ''}`}
            x1={x1}
            y1={y1 + L.nh / 2}
            x2={x2}
            y2={y2 - L.nh / 2}
          />
        )
      })}

      {Object.entries(NODES).map(([id, n]) => {
        const [cx, cy] = L.pos[id]
        const isSel = id === selected
        const round = n.kind === 'Human' ? L.nh / 2 : n.kind === 'Storage' ? 4 : 8
        return (
          <g
            key={id}
            className={`hq-node ${isSel ? 'sel' : ''} ${linked(id) ? 'linked' : ''} ${
              n.kind === 'Storage' || n.kind === 'Capability' ? 'res' : ''
            }`}
            role="button"
            tabIndex={0}
            aria-pressed={isSel}
            aria-label={`${n.label}, ${n.kind.toLowerCase()}`}
            onClick={() => onSelect(id)}
            onKeyDown={e => onKey(e, id)}
          >
            <rect
              x={cx - L.nw / 2}
              y={cy - L.nh / 2}
              width={L.nw}
              height={L.nh}
              rx={round}
            />
            <text x={cx} y={cy} dy="0.35em" textAnchor="middle" style={{ fontSize: L.font }}>
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const ArchMap = () => {
  const [selected, setSelected] = useState('orchestrator')
  const reduce = useReducedMotion()
  const n = NODES[selected]

  return (
    <div className="hq-panel">
      <ArchSvg layout="wide" className="hq-wide" selected={selected} onSelect={setSelected} />
      <ArchSvg layout="narrow" className="hq-narrow" selected={selected} onSelect={setSelected} />
      <div className="hq-detail" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
          >
            <p className="hq-kicker">{n.kind}</p>
            <h3>{n.label}</h3>
            <dl>
              <div>
                <dt>What it does</dt>
                <dd>{n.what}</dd>
              </div>
              <div>
                <dt>Why this choice</dt>
                <dd>{n.why}</dd>
              </div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- *
 * b. Before / after containment
 * ---------------------------------------------------------------- */

const RULES = [
  {
    topic: 'Files',
    open: 'Reads and writes anywhere on the server.',
    boxed: 'Its own workspace, plus read-only shared notes.'
  },
  {
    topic: 'Secrets',
    open: 'Can read every key and token lying around.',
    boxed: 'Reads none. Credentials stay inside the tools that need them.'
  },
  {
    topic: 'Tools',
    open: 'Any command it can think of.',
    boxed: 'An allowlist, granted one tool at a time.'
  },
  {
    topic: 'Outside content',
    open: 'A web page or an issue can tell it what to do.',
    boxed: 'Read as data. Only the brief gives instructions.'
  },
  {
    topic: 'Irreversible actions',
    open: 'Runs them straight away.',
    boxed: 'Paused until a person says yes.'
  }
]

// Resources around the agent: angle in degrees, and whether the boxed agent still reaches them
const REACH = [
  { a: -90, label: 'workspace', keep: true },
  { a: -30, label: 'notes (read)', keep: true },
  { a: 30, label: 'secrets', keep: false },
  { a: 90, label: 'other agents', keep: false },
  { a: 150, label: 'private vault', keep: false },
  { a: 210, label: 'any command', keep: false }
]

const ReachSvg = ({ boxed, reduce }) => {
  const t = { duration: reduce ? 0 : 0.6, ease: EASE }
  return (
    <svg className="hq-reach" viewBox="0 0 320 300" aria-hidden="true">
      <motion.circle
        className="hq-reach-zone"
        cx="160"
        cy="150"
        initial={false}
        animate={{ r: boxed ? 68 : 128 }}
        transition={t}
      />
      {REACH.map(r => {
        const rad = (r.a * Math.PI) / 180
        const x = 160 + Math.cos(rad) * 104
        const y = 150 + Math.sin(rad) * 104
        const live = !boxed || r.keep
        const ex = 160 + Math.cos(rad) * (live ? 96 : 60)
        const ey = 150 + Math.sin(rad) * (live ? 96 : 60)
        return (
          <g key={r.label}>
            <motion.line
              className={`hq-reach-line ${live ? 'live' : ''}`}
              x1="160"
              y1="150"
              initial={false}
              animate={{ x2: ex, y2: ey }}
              transition={t}
            />
            <circle className={`hq-reach-dot ${live ? 'live' : ''}`} cx={x} cy={y} r="5" />
            <text
              className={`hq-reach-text ${live ? 'live' : ''}`}
              x={x}
              y={y + (Math.sin(rad) < -0.5 ? -12 : 20)}
              textAnchor="middle"
            >
              {r.label}
            </text>
          </g>
        )
      })}
      <circle className="hq-reach-core" cx="160" cy="150" r="16" />
      <text className="hq-reach-text live" x="160" y="150" dy="0.35em" textAnchor="middle">
        agent
      </text>
    </svg>
  )
}

const Containment = () => {
  const [boxed, setBoxed] = useState(false)
  const reduce = useReducedMotion()

  return (
    <div className="hq-panel">
      <div className="hq-switch" role="group" aria-label="Agent permissions">
        <button type="button" aria-pressed={!boxed} onClick={() => setBoxed(false)}>
          Every right
        </button>
        <button type="button" aria-pressed={boxed} onClick={() => setBoxed(true)}>
          Boxed in
        </button>
      </div>

      <div className="hq-contain">
        <figure className="hq-reach-wrap">
          <ReachSvg boxed={boxed} reduce={reduce} />
          <figcaption>What one mistake can reach.</figcaption>
        </figure>

        <ul className="hq-rules" aria-live="polite">
          {RULES.map(r => (
            <li key={r.topic} className={boxed ? 'boxed' : 'open'}>
              <span className="hq-rule-topic">{r.topic}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={boxed ? 'b' : 'o'}
                  className="hq-rule-text"
                  initial={reduce ? false : { opacity: 0, x: boxed ? 8 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
                >
                  {boxed ? r.boxed : r.open}
                </motion.span>
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- *
 * c. A request, end to end
 * ---------------------------------------------------------------- */

const STEPS = [
  {
    name: 'Request',
    who: 'You',
    body: 'I write what I want in plain words, from wherever I am. Nothing runs yet.'
  },
  {
    name: 'Clarify',
    who: 'orchestrator',
    body: 'The orchestrator asks the questions it needs answered instead of guessing: scope, what done looks like, what is off limits.'
  },
  {
    name: 'Brief',
    who: 'You',
    gate: true,
    body: 'It writes a short brief: goal, files in scope, red lines, how success is checked. Work starts only once I approve it.'
  },
  {
    name: 'Build',
    who: 'coder',
    body: 'The coder works in a fresh, isolated environment on its own branch. It cannot reach the server, the private vault or the main branch.'
  },
  {
    name: 'Pull request',
    who: 'coder',
    body: 'It runs the project checks, then opens a pull request that says what changed, what was verified and what was not.'
  },
  {
    name: 'Review',
    who: 'You',
    body: 'I read the diff and the checks. Questions go back as comments, and the next round starts from there.'
  },
  {
    name: 'Merge',
    who: 'You',
    gate: true,
    body: 'Nothing is merged or deployed until I say so, explicitly. No agent holds the right to do it.'
  }
]

const Journey = () => {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reduce = useReducedMotion()
  const last = STEPS.length - 1

  useEffect(() => {
    if (!playing) return
    if (step >= last) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setStep(s => Math.min(s + 1, last)), 2200)
    return () => clearTimeout(id)
  }, [playing, step, last])

  const go = i => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(last, i)))
  }

  const play = () => {
    if (playing) return setPlaying(false)
    if (step >= last) setStep(0)
    setPlaying(true)
  }

  const s = STEPS[step]

  return (
    <div className="hq-panel">
      <ol className="hq-track" style={{ '--n': STEPS.length }}>
        <span className="hq-track-fill" aria-hidden="true" style={{ '--p': step / last }} />
        {STEPS.map((st, i) => (
          <li key={st.name}>
            <button
              type="button"
              className={`${i === step ? 'cur' : ''} ${i < step ? 'done' : ''} ${st.gate ? 'gate' : ''}`}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => go(i)}
            >
              <span className="hq-dot" aria-hidden="true" />
              <span className="hq-step-name">{st.name}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="hq-step" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
          >
            <p className="hq-kicker">
              Step {step + 1} of {STEPS.length} · {s.who}
              {s.gate && <span className="hq-badge">needs a yes</span>}
            </p>
            <h3>{s.name}</h3>
            <p>{s.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hq-controls">
        <button type="button" className="link" onClick={() => go(step - 1)} disabled={step === 0}>
          ← Previous
        </button>
        <button type="button" className="link" onClick={play} aria-pressed={playing}>
          {playing ? 'Pause' : step >= last ? 'Replay' : 'Play'}
        </button>
        <button type="button" className="link" onClick={() => go(step + 1)} disabled={step === last}>
          Next →
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- *
 * Page
 * ---------------------------------------------------------------- */

const principles = [
  {
    title: 'Outside text is data',
    body: 'Web pages, issues, emails and files written by others are read as material to work on, never as instructions. Only the approved brief says what to do.'
  },
  {
    title: 'Each agent writes in its own lane',
    body: 'Every agent has its own write rights: its workspace, its folder of notes, its branch. Reading is shared, writing is not.'
  },
  {
    title: 'Personal data stays apart',
    body: 'Anything personal lives in a separate vault on its own. The agents that code, watch or browse have no way to see it.'
  },
  {
    title: 'Nothing ships without a yes',
    body: 'Merging, deploying, deleting or sending anything out waits for an explicit go from me. Silence is a no.'
  },
  {
    title: 'A quota on consumption',
    body: 'Each agent has a usage budget. When it runs out, the work stops and waits, instead of looping on a bad idea all night.'
  },
  {
    title: 'Quiet hours',
    body: 'Outside set hours, agents do not start new work and do not ping me, apart from a real alert.'
  },
  {
    title: 'A log of what each agent did',
    body: 'Every agent keeps a plain log of what it read, ran and wrote, so a strange result can be traced back step by step.'
  },
  {
    title: 'Boring, visible plumbing',
    body: 'Plain-text notes, branches and pull requests. Every piece of state can be opened, read and reverted with ordinary tools.'
  }
]

const limits = [
  {
    title: 'Prompt injection is contained, not solved',
    body: 'Reading outside text as data lowers the odds. The tight permissions are what keep a fooled agent from doing real damage.'
  },
  {
    title: 'Approvals can turn into habit',
    body: 'A yes given without reading is worth nothing. Short briefs and small pull requests keep reviews cheap enough to stay real.'
  },
  {
    title: 'This page leaves things out on purpose',
    body: 'No hostnames, paths, configuration or prompts are shown. The design should hold even if they were known, but there is no reason to hand them out.'
  }
]

export default function Hq() {
  return (
    <>
      <Head>
        <title>An AI agent team on a small server · Louis Forrer</title>
        <meta property="og:title" content="An AI agent team on a small server · Louis Forrer" />
        <meta name="description" content={project.tagline} />
      </Head>

      <div className="case-band">
        <Dither src={paintings.dusk.src} cell={6} radius={140} text="agents" textTop={84} />
      </div>
      <h1 className="sr-only">{project.title}</h1>

      <section className="case-hero container">
        <Reveal className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#work">Work</Link> / hq
        </Reveal>
        <Reveal as="p" delay={0.05} className="lede">
          {project.tagline}
        </Reveal>
        <Reveal delay={0.1} as="dl" className="facts">
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>Everything, solo</dd>
          </div>
          <div>
            <dt>Runs on</dt>
            <dd>A small private server</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>Private, on purpose</dd>
          </div>
        </Reveal>
      </section>

      <section className="container">
        <Reveal className="numbers">
          {project.stats.map(s => (
            <div key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </Reveal>
      </section>

      <div style={{ height: 64 }} />

      <Block title="Why">
        <Reveal className="prose">
          <p>
            AI agents are useful when they can act: write code, read notes, check on things.
            That is also what makes them risky. I wanted a team I could hand real work to
            <strong> without handing over the keys</strong>.
          </p>
          <p>
            So the setup starts from the other end. Each agent gets the smallest set of
            rights that lets it do its one job, personal data sits somewhere none of the
            others can reach, and every step that cannot be undone waits for a person.
          </p>
        </Reveal>
      </Block>

      <Block title="Architecture">
        <Reveal className="prose">
          <p>
            One orchestrator, a few specialised agents, two vaults that never touch, and
            tools handed out one by one. Everything runs on a small private server, reachable
            only over a private network. <strong>Click a box</strong> to see what it does and
            why it is built that way.
          </p>
        </Reveal>
        <Reveal style={{ marginTop: 32 }}>
          <ArchMap />
        </Reveal>
      </Block>

      <Block title="Isolation">
        <Reveal className="prose">
          <p>
            The same agent, two ways. With every right, one confused step can reach anything
            on the machine. Boxed in, the worst case is <strong>a bad pull request</strong>{' '}
            that I decline.
          </p>
        </Reveal>
        <Reveal style={{ marginTop: 32 }}>
          <Containment />
        </Reveal>
      </Block>

      <Block title="Workflow">
        <Reveal className="prose">
          <p>
            Every piece of work follows the same path, from a sentence I type to a merge I
            approve. Two of the seven steps are <strong>human gates</strong>: nothing moves
            past them on its own.
          </p>
        </Reveal>
        <Reveal style={{ marginTop: 32 }}>
          <Journey />
        </Reveal>
      </Block>

      <Block title="Dashboard">
        <Reveal className="prose">
          <p>
            I talk to the team from my phone. A small web app shows the morning brief, the
            conversation with the orchestrator, every project with its pull request and the
            health of the server. <strong>Merge is a button only I can press</strong>.
          </p>
        </Reveal>
        <Reveal style={{ marginTop: 32 }}>
          <HqPhone />
        </Reveal>
      </Block>

      <Block title="Principles">
        <Reveal as="ul" className="points" style={{ marginTop: 0 }}>
          {principles.map(pt => (
            <li key={pt.title}>
              <h3>{pt.title}</h3>
              <p>{pt.body}</p>
            </li>
          ))}
        </Reveal>
      </Block>

      <Block title="Limits">
        <Reveal as="ul" className="points" style={{ marginTop: 0 }}>
          {limits.map(pt => (
            <li key={pt.title}>
              <h3>{pt.title}</h3>
              <p>{pt.body}</p>
            </li>
          ))}
        </Reveal>
        <Reveal>
          <div className="feature-links" style={{ marginTop: 48 }}>
            <Link href="/#work" className="link">
              ← Back to work
            </Link>
          </div>
        </Reveal>
      </Block>

      <style jsx global>{`
        .hq-panel {
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--raised);
          padding: clamp(16px, 3vw, 28px);
        }

        .hq-kicker {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--dim);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* architecture */
        .hq-arch {
          display: block;
          width: 100%;
          height: auto;
          font-family: var(--mono);
          -webkit-tap-highlight-color: transparent;
        }
        .hq-narrow {
          display: none;
        }
        @media (max-width: 640px) {
          .hq-wide {
            display: none;
          }
          .hq-narrow {
            display: block;
          }
        }
        .hq-zone {
          fill: none;
          stroke: var(--line);
          stroke-dasharray: 4 5;
        }
        .hq-zone-label {
          font-size: 11px;
          fill: var(--dim);
        }
        .hq-edge {
          stroke: var(--line);
          stroke-width: 1;
          transition: stroke 0.2s;
        }
        .hq-edge.on {
          stroke: var(--red);
        }
        .hq-node {
          cursor: pointer;
          outline: none;
        }
        .hq-node rect {
          fill: var(--bg);
          stroke: var(--line);
          stroke-width: 1;
          transition: stroke 0.2s, fill 0.2s;
        }
        .hq-node.res rect {
          stroke-dasharray: 3 3;
        }
        .hq-node text {
          fill: var(--muted);
          transition: fill 0.2s;
          pointer-events: none;
        }
        .hq-node:hover rect,
        .hq-node.linked rect {
          stroke: rgba(255, 255, 255, 0.35);
        }
        .hq-node:hover text {
          fill: var(--text);
        }
        .hq-node.sel rect {
          stroke: var(--red);
          stroke-dasharray: none;
        }
        .hq-node.sel text {
          fill: var(--text);
        }
        .hq-node:focus-visible rect {
          stroke: var(--red);
          stroke-width: 2;
        }

        .hq-detail {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid var(--line-soft);
          min-height: 190px;
        }
        .hq-detail h3,
        .hq-step h3 {
          margin-top: 6px;
          font-size: clamp(22px, 2.4vw, 28px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .hq-detail dl {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 32px;
          margin: 16px 0 0;
        }
        .hq-detail dt {
          font-size: 14px;
          color: var(--dim);
        }
        .hq-detail dd {
          margin: 4px 0 0;
          font-size: 16px;
          line-height: 1.6;
          color: var(--muted);
        }
        @media (max-width: 640px) {
          .hq-detail dl {
            grid-template-columns: 1fr;
          }
        }

        /* containment */
        .hq-switch {
          display: inline-flex;
          flex-wrap: wrap;
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 3px;
          gap: 3px;
        }
        .hq-switch button {
          border: 0;
          border-radius: 4px;
          padding: 8px 14px;
          background: transparent;
          color: var(--muted);
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        @media (max-width: 520px) {
          .hq-switch {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 100%;
          }
          .hq-switch button {
            padding: 8px 10px;
            font-size: 14px;
          }
        }
        .hq-switch button:hover {
          color: var(--text);
        }
        .hq-switch button[aria-pressed='true'] {
          background: var(--text);
          color: var(--bg);
        }
        .hq-contain {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 24px 32px;
          align-items: center;
          margin-top: 24px;
        }
        @media (max-width: 760px) {
          .hq-contain {
            grid-template-columns: 1fr;
          }
        }
        .hq-reach-wrap {
          margin: 0;
        }
        .hq-reach-wrap figcaption {
          margin-top: 6px;
          font-size: 13px;
          color: var(--dim);
          text-align: center;
        }
        .hq-reach {
          display: block;
          width: 100%;
          max-width: 360px;
          height: auto;
          margin: 0 auto;
          font-family: var(--mono);
        }
        .hq-reach-zone {
          fill: rgba(255, 75, 51, 0.06);
          stroke: var(--red);
          stroke-width: 1;
          stroke-dasharray: 4 4;
        }
        .hq-reach-line {
          stroke: var(--line);
          stroke-width: 1;
        }
        .hq-reach-line.live {
          stroke: var(--red);
        }
        .hq-reach-dot {
          fill: var(--bg);
          stroke: var(--dim);
        }
        .hq-reach-dot.live {
          fill: var(--red);
          stroke: var(--red);
        }
        .hq-reach-core {
          fill: var(--bg);
          stroke: var(--text);
        }
        .hq-reach-text {
          font-size: 11px;
          fill: var(--dim);
        }
        .hq-reach-text.live {
          fill: var(--text);
        }
        .hq-rules {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .hq-rules li {
          display: grid;
          grid-template-columns: 140px minmax(0, 1fr);
          gap: 4px 16px;
          padding: 12px 0;
          border-top: 1px solid var(--line-soft);
          font-size: 15px;
          line-height: 1.5;
        }
        .hq-rules li:first-child {
          border-top: 0;
        }
        .hq-rule-topic {
          color: var(--dim);
        }
        .hq-rules li.open .hq-rule-text {
          color: var(--red);
        }
        .hq-rules li.boxed .hq-rule-text {
          color: var(--text);
        }
        @media (max-width: 460px) {
          .hq-rules li {
            grid-template-columns: 1fr;
          }
        }

        /* journey */
        .hq-track {
          position: relative;
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(var(--n), minmax(0, 1fr));
        }
        .hq-track::before,
        .hq-track-fill {
          content: '';
          position: absolute;
          top: 15px;
          left: calc(100% / var(--n) / 2);
          right: calc(100% / var(--n) / 2);
          height: 1px;
          background: var(--line);
        }
        .hq-track-fill {
          display: block;
          background: var(--red);
          transform-origin: left center;
          transform: scaleX(var(--p, 0));
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hq-track li {
          position: relative;
        }
        .hq-track button {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 8px 2px;
          border: 0;
          border-radius: 6px;
          background: none;
          cursor: pointer;
          color: var(--dim);
          font-size: 13px;
          text-align: center;
          transition: color 0.2s;
        }
        .hq-track button:hover {
          color: var(--text);
        }
        .hq-dot {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--raised);
          transition: background 0.3s, border-color 0.3s, transform 0.3s;
        }
        .hq-track button.gate .hq-dot {
          border-radius: 4px;
          transform: rotate(45deg);
        }
        .hq-track button.done .hq-dot {
          border-color: var(--red);
        }
        .hq-track button.cur {
          color: var(--text);
        }
        .hq-track button.cur .hq-dot {
          background: var(--red);
          border-color: var(--red);
        }
        .hq-step-name {
          line-height: 1.25;
        }
        @media (max-width: 640px) {
          .hq-track {
            grid-template-columns: 1fr;
          }
          .hq-track::before,
          .hq-track-fill {
            top: calc(100% / var(--n) / 2);
            bottom: calc(100% / var(--n) / 2);
            left: 15px;
            right: auto;
            width: 1px;
            height: auto;
          }
          .hq-track-fill {
            transform-origin: center top;
            transform: scaleY(var(--p, 0));
          }
          .hq-track button {
            flex-direction: row;
            gap: 14px;
            padding: 6px 8px;
            font-size: 15px;
            text-align: left;
          }
        }

        .hq-step {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid var(--line-soft);
          min-height: 160px;
        }
        .hq-step p:last-child {
          margin-top: 10px;
          max-width: 640px;
          color: var(--muted);
          line-height: 1.65;
        }
        .hq-badge {
          margin-left: 10px;
          padding: 1px 6px;
          border: 1px solid var(--red);
          border-radius: 4px;
          color: var(--red);
        }
        .hq-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 22px;
          margin-top: 20px;
          font-weight: 500;
        }
        .hq-controls button:disabled {
          color: var(--dim);
          cursor: default;
          background-size: 0 1px;
        }
      `}</style>
    </>
  )
}
