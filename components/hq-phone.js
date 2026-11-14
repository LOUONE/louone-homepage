import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import {
  FiCode,
  FiCompass,
  FiCpu,
  FiEdit3,
  FiHome,
  FiLink,
  FiMail,
  FiRadio,
  FiSend,
  FiTrendingUp
} from 'react-icons/fi'

/*
 * A redrawn, animated replay of the phone dashboard used to talk to the agents.
 * Layout follows the real app; every value and every line of text is made up.
 */

const EASE = [0.22, 1, 0.36, 1]
const SCENE_MS = 6500

const TABS = [FiHome, FiCompass, FiRadio, FiTrendingUp, FiMail, FiCode, FiEdit3, FiCpu]

const SCENES = [
  {
    key: 'home',
    tab: 0,
    name: 'Home',
    body: 'The morning brief: agenda, mail to handle and a short security watch, written by the agents before I wake up.'
  },
  {
    key: 'chat',
    tab: 1,
    name: 'Chat',
    body: 'One conversation with the orchestrator. It says what it cannot see or do instead of guessing.'
  },
  {
    key: 'projects',
    tab: 6,
    name: 'Projects',
    body: 'Each piece of work and its pull request. Merging is a button only I can press.'
  },
  {
    key: 'system',
    tab: 7,
    name: 'System',
    body: 'The health of the small server and what the agents cost today, against a monthly budget.'
  }
]

const up = (reduce, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: reduce ? 0 : 0.45, delay: reduce ? 0 : delay, ease: EASE }
})

/* -------------------------------- screens ------------------------------- */

const Typing = ({ text, reduce, delay = 0, speed = 38 }) => {
  const [n, setN] = useState(reduce ? text.length : 0)
  useEffect(() => {
    if (reduce) return setN(text.length)
    let id
    const start = setTimeout(() => {
      id = setInterval(() => setN(v => (v >= text.length ? v : v + 1)), speed)
    }, delay * 1000)
    return () => {
      clearTimeout(start)
      clearInterval(id)
    }
  }, [text, reduce, delay, speed])
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="ph-caret" />}
    </>
  )
}

const Home = ({ reduce }) => (
  <div className="ph-screen">
    <motion.h4 {...up(reduce)}>Good evening</motion.h4>
    <motion.p className="ph-sub" {...up(reduce, 0.05)}>
      Saturday
    </motion.p>
    <motion.p className="ph-h5" {...up(reduce, 0.15)}>
      Brief of the day
    </motion.p>
    <motion.div className="ph-card" {...up(reduce, 0.3)}>
      <p className="ph-label">Agenda</p>
      <p className="ph-muted">nothing to report</p>
    </motion.div>
    <motion.div className="ph-card" {...up(reduce, 0.5)}>
      <p className="ph-label">Mail to handle</p>
      <p className="ph-muted">2 to sort, none urgent</p>
    </motion.div>
    <motion.div className="ph-card" {...up(reduce, 0.7)}>
      <p className="ph-label">Watch</p>
      <span className="ph-chip">today</span>
      <p className="ph-item">New release of the coding agent</p>
      <p className="ph-src">changelog</p>
      <div className="ph-rule" />
      <p className="ph-item">Patch out for a VPN appliance flaw</p>
      <p className="ph-src">security news</p>
    </motion.div>
    <div className="ph-input">
      <span>
        <Typing text="What changed on the server today?" reduce={reduce} delay={1.8} />
      </span>
      <span className="ph-send">
        <FiSend />
      </span>
    </div>
  </div>
)

const Chat = ({ reduce }) => {
  const [answered, setAnswered] = useState(reduce)
  useEffect(() => {
    if (reduce) return setAnswered(true)
    const id = setTimeout(() => setAnswered(true), 1700)
    return () => clearTimeout(id)
  }, [reduce])

  const lines = [
    'I have no shell and cannot see the server setup, so here is the general way:',
    '1. Tell the coder, and check that no task or pull request is running.',
    '2. Shut down cleanly, wait for the light to stop blinking.',
    '3. Unplug, make the change, plug back in.',
    'Scheduled briefs are skipped while it is off, so avoid those times.'
  ]

  return (
    <div className="ph-screen ph-chat">
      <motion.div className="ph-bubble me" {...up(reduce, 0.1)}>
        How do I power off the server to change something without breaking anything?
      </motion.div>
      <AnimatePresence mode="wait" initial={false}>
        {!answered ? (
          <motion.div
            key="dots"
            className="ph-bubble them ph-dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.5 }}
          >
            <i />
            <i />
            <i />
          </motion.div>
        ) : (
          <motion.div
            key="answer"
            className="ph-bubble them"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {lines.map((l, i) => (
              <motion.p key={i} {...up(reduce, 0.1 + i * 0.35)}>
                {l}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="ph-input">
        <span className="ph-ph">Write to the orchestrator…</span>
        <span className="ph-send">
          <FiSend />
        </span>
      </div>
    </div>
  )
}

const Projects = ({ reduce }) => {
  const [done, setDone] = useState(reduce)
  useEffect(() => {
    if (reduce) return setDone(true)
    const id = setTimeout(() => setDone(true), 2600)
    return () => clearTimeout(id)
  }, [reduce])

  return (
    <div className="ph-screen">
      <motion.h4 {...up(reduce)}>Projects</motion.h4>
      <motion.p className="ph-sub" {...up(reduce, 0.05)}>
        1 project · {done ? '0 running · 1 to review' : '1 running · 0 to review'}
      </motion.p>
      <motion.div className="ph-filters" {...up(reduce, 0.15)}>
        <span className="on">All</span>
        <span>Running</span>
        <span>To review</span>
      </motion.div>
      <motion.div className="ph-card" {...up(reduce, 0.3)}>
        <div className="ph-row">
          <p className="ph-title">
            demo <span className="ph-mono">demo</span>
          </p>
          <span className={`ph-status ${done ? 'review' : ''}`}>
            {done ? 'to review' : 'running'}
            {!done && (
              <span className="ph-dots inline">
                <i />
                <i />
                <i />
              </span>
            )}
          </span>
        </div>
        <p className="ph-muted">started 4 min ago</p>
        <p className="ph-muted">
          <span className="ph-mono">projet/demo</span> · updated {done ? 'just now' : '4 min ago'}
        </p>
        <div className="ph-btns">
          <span className={`ph-btn ${done ? '' : 'off'}`}>
            <FiLink /> PR #12
          </span>
          <span className={`ph-btn ${done ? '' : 'off'}`}>Give feedback</span>
          <motion.span
            className={`ph-btn ${done ? 'gate' : 'off'}`}
            animate={done && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          >
            Merge
          </motion.span>
          <span className="ph-btn">Follow the session</span>
        </div>
      </motion.div>
      <AnimatePresence>
        {done && (
          <motion.p className="ph-note" {...up(reduce, 0.5)}>
            Waiting for my yes. No agent can press Merge.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

const Bar = ({ label, value, pct, reduce, delay }) => (
  <div className="ph-meter">
    <div className="ph-row">
      <span>{label}</span>
      <span className="ph-mono">{value}</span>
    </div>
    <div className="ph-track">
      <motion.span
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: pct }}
        transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : delay, ease: EASE }}
      />
    </div>
  </div>
)

const CountUp = ({ to, reduce, delay = 0 }) => {
  const [v, setV] = useState(reduce ? to : 0)
  useEffect(() => {
    if (reduce) return setV(to)
    let raf
    let t0
    const start = setTimeout(() => {
      const tick = t => {
        t0 = t0 || t
        const k = Math.min(1, (t - t0) / 900)
        setV(to * (1 - Math.pow(1 - k, 3)))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay * 1000)
    return () => {
      clearTimeout(start)
      cancelAnimationFrame(raf)
    }
  }, [to, reduce, delay])
  return <>${v.toFixed(2)}</>
}

const SPEND = [0.3, 0.9, 0.6, 1.4, 0.8, 1.1, 0.74]

const System = ({ reduce }) => {
  const max = Math.max(...SPEND)
  const pts = SPEND.map((v, i) => [10 + (i * 220) / (SPEND.length - 1), 62 - (v / max) * 50])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <div className="ph-screen">
      <motion.h4 {...up(reduce)}>System</motion.h4>
      <motion.p className="ph-sub" {...up(reduce, 0.05)}>
        Small server · online for 3 h 12 min
      </motion.p>
      <motion.div className="ph-card" {...up(reduce, 0.15)}>
        <p className="ph-label">Server health</p>
        <Bar label="Temperature" value="42 °C" pct={0.47} reduce={reduce} delay={0.4} />
        <Bar label="Disk" value="13 %" pct={0.13} reduce={reduce} delay={0.55} />
        <Bar label="Memory" value="23 %" pct={0.23} reduce={reduce} delay={0.7} />
        <div className="ph-row ph-mono ph-small">
          <span>Load 0.30</span>
          <span>Uptime 3 h 12</span>
        </div>
        <div className="ph-btns">
          <span className="ph-btn">Restart</span>
          <span className="ph-btn">Power off</span>
        </div>
      </motion.div>
      <motion.div className="ph-card" {...up(reduce, 0.35)}>
        <p className="ph-label">Spend</p>
        <div className="ph-spend">
          <div>
            <span className="ph-muted">Today</span>
            <b>
              <CountUp to={0.74} reduce={reduce} delay={0.8} />
            </b>
          </div>
          <div>
            <span className="ph-muted">This month</span>
            <b>
              <CountUp to={12.4} reduce={reduce} delay={0.9} />
            </b>
          </div>
        </div>
        <p className="ph-muted ph-small">Monthly budget $50 · 25 % used</p>
        <svg className="ph-spark" viewBox="0 0 240 70" aria-hidden="true">
          <motion.path
            d={d}
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 1.4, delay: reduce ? 0 : 1, ease: EASE }}
          />
          <motion.circle
            cx={lx}
            cy={ly}
            r="3.5"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 2.3 }}
          />
        </svg>
      </motion.div>
    </div>
  )
}

const SCREENS = { home: Home, chat: Chat, projects: Projects, system: System }

/* -------------------------------- shell --------------------------------- */

export default function HqPhone() {
  const prefersReduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // Only trust the media query after hydration, so server and client render the same markup
  const reduce = mounted && prefersReduced

  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [run, setRun] = useState(0) // bumps to replay a scene from the start
  const running = inView && !paused && !reduce

  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => setI(n => (n + 1) % SCENES.length), SCENE_MS)
    return () => clearTimeout(id)
  }, [running, i, run])

  const go = n => {
    setI(n)
    setRun(r => r + 1)
  }

  const scene = SCENES[i]
  const Screen = SCREENS[scene.key]

  return (
    <div className="hq-panel ph-wrap" ref={ref}>
      <figure className="ph-figure">
        <div className="ph-phone" aria-hidden="true">
          <div className="ph-notch" />
          <div className="ph-view">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${scene.key}-${run}`}
                className="ph-page"
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
              >
                {inView || reduce || !mounted ? <Screen reduce={reduce} /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
          <nav className="ph-nav">
            {TABS.map((Icon, t) => (
              <span key={t} className={`ph-tab ${t === scene.tab ? 'on' : ''}`}>
                {t === scene.tab && (
                  <motion.span
                    layoutId="ph-tab-mark"
                    className="ph-tab-mark"
                    transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                  />
                )}
                <Icon />
              </span>
            ))}
          </nav>
        </div>
        <figcaption>Redrawn from the real app. Every value on screen is made up.</figcaption>
      </figure>

      <div className="ph-side">
        <ol className="ph-steps">
          {SCENES.map((s, n) => (
            <li key={s.key}>
              <button
                type="button"
                className={n === i ? 'cur' : ''}
                aria-current={n === i ? 'step' : undefined}
                onClick={() => go(n)}
              >
                <span className="ph-step-name">{s.name}</span>
                <span className="ph-step-body">{s.body}</span>
                {n === i && running && (
                  <span
                    key={`${i}-${run}`}
                    className="ph-progress"
                    style={{ animationDuration: `${SCENE_MS}ms` }}
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          ))}
        </ol>
        {!reduce && (
          <div className="hq-controls">
            <button
              type="button"
              className="link"
              onClick={() => setPaused(p => !p)}
              aria-pressed={paused}
            >
              {paused ? 'Play' : 'Pause'}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .ph-wrap {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 28px 48px;
          align-items: center;
        }
        @media (max-width: 760px) {
          .ph-wrap {
            grid-template-columns: 1fr;
          }
        }
        .ph-figure {
          margin: 0;
        }
        .ph-figure figcaption {
          margin-top: 10px;
          font-size: 13px;
          color: var(--dim);
          text-align: center;
        }
        .ph-phone {
          position: relative;
          width: 300px;
          max-width: 100%;
          height: 620px;
          margin: 0 auto;
          border: 1px solid var(--line);
          border-radius: 40px;
          padding: 10px;
          background: #050505;
          box-shadow: 0 30px 80px -40px rgba(255, 75, 51, 0.35);
        }
        .ph-notch {
          position: absolute;
          top: 18px;
          left: 50%;
          width: 84px;
          height: 22px;
          margin-left: -42px;
          border-radius: 12px;
          background: #000;
          z-index: 3;
        }
        .ph-view {
          position: absolute;
          inset: 10px 10px 70px;
          border-radius: 30px 30px 0 0;
          overflow: hidden;
          background: radial-gradient(120% 60% at 30% 0%, rgba(255, 75, 51, 0.12), transparent 60%),
            var(--raised);
        }
        .ph-page {
          height: 100%;
        }
        .ph-screen {
          position: relative;
          height: 100%;
          padding: 52px 16px 70px;
          font-size: 12.5px;
          line-height: 1.4;
          color: var(--text);
          overflow: hidden;
        }
        .ph-screen h4 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .ph-screen p {
          margin: 0;
        }
        .ph-sub {
          margin-top: 2px !important;
          color: var(--muted);
        }
        .ph-h5 {
          margin: 16px 0 8px !important;
          font-size: 15px;
          font-weight: 700;
        }
        .ph-card {
          margin-top: 10px;
          padding: 12px 13px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.025);
        }
        .ph-label {
          margin-bottom: 6px !important;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .ph-muted {
          color: var(--muted);
        }
        .ph-small {
          font-size: 11px;
        }
        .ph-mono {
          font-family: var(--mono);
        }
        .ph-chip {
          display: inline-block;
          padding: 1px 8px;
          border: 1px solid var(--line);
          border-radius: 99px;
          font-size: 10.5px;
          color: var(--muted);
        }
        .ph-item {
          margin-top: 6px !important;
        }
        .ph-src {
          font-size: 11px;
          color: var(--dim);
        }
        .ph-rule {
          height: 1px;
          margin: 8px 0 2px;
          background: var(--line-soft);
        }
        .ph-input {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: 44px;
          padding: 6px 6px 6px 14px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--bg);
          font-size: 12.5px;
        }
        .ph-ph {
          color: var(--dim);
        }
        .ph-send {
          flex: none;
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--red);
          color: #fff;
        }
        .ph-caret {
          display: inline-block;
          width: 1px;
          height: 1em;
          margin-left: 1px;
          vertical-align: -2px;
          background: var(--text);
          animation: ph-blink 1s steps(1) infinite;
        }
        @keyframes ph-blink {
          50% {
            opacity: 0;
          }
        }

        /* chat */
        .ph-chat {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ph-bubble {
          max-width: 86%;
          padding: 9px 12px;
          border-radius: 14px;
          border: 1px solid var(--line);
        }
        .ph-bubble.me {
          align-self: flex-end;
          background: rgba(255, 255, 255, 0.07);
        }
        .ph-bubble.them {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.025);
        }
        .ph-bubble.them p + p {
          margin-top: 5px !important;
        }
        .ph-dots {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
        .ph-dots i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--muted);
          animation: ph-bounce 1s ease-in-out infinite;
        }
        .ph-dots i:nth-child(2) {
          animation-delay: 0.15s;
        }
        .ph-dots i:nth-child(3) {
          animation-delay: 0.3s;
        }
        .ph-dots.inline {
          margin-left: 6px;
        }
        .ph-dots.inline i {
          width: 3px;
          height: 3px;
        }
        @keyframes ph-bounce {
          0%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }

        /* projects */
        .ph-filters {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }
        .ph-filters span,
        .ph-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border: 1px solid var(--line);
          border-radius: 99px;
          font-size: 11.5px;
          color: var(--text);
          transition: color 0.3s, border-color 0.3s, background 0.3s;
        }
        .ph-filters span.on {
          background: rgba(255, 255, 255, 0.08);
        }
        .ph-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .ph-title {
          font-size: 15px;
          font-weight: 700;
        }
        .ph-title .ph-mono {
          font-weight: 400;
          font-size: 12px;
          color: var(--muted);
        }
        .ph-status {
          display: inline-flex;
          align-items: center;
          padding: 2px 9px;
          border: 1px solid var(--line);
          border-radius: 99px;
          font-size: 11px;
          color: var(--muted);
          white-space: nowrap;
        }
        .ph-status.review {
          border-color: var(--red);
          color: var(--red);
        }
        .ph-card > .ph-muted {
          margin-top: 4px !important;
        }
        .ph-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }
        .ph-btn.off {
          color: var(--dim);
          border-color: var(--line-soft);
        }
        .ph-btn.gate {
          border-color: var(--red);
          color: var(--text);
          background: rgba(255, 75, 51, 0.14);
        }
        .ph-note {
          margin-top: 12px !important;
          font-size: 11.5px;
          color: var(--red);
        }

        /* system */
        .ph-meter {
          margin-top: 9px;
        }
        .ph-track {
          height: 5px;
          margin-top: 5px;
          border-radius: 3px;
          background: var(--line-soft);
          overflow: hidden;
        }
        .ph-track span {
          display: block;
          height: 100%;
          border-radius: 3px;
          background: var(--muted);
          transform-origin: left center;
        }
        .ph-meter + .ph-row {
          margin-top: 10px;
          color: var(--muted);
        }
        .ph-spend {
          display: flex;
          gap: 26px;
        }
        .ph-spend div {
          display: grid;
        }
        .ph-spend b {
          font-family: var(--mono);
          font-size: 22px;
          font-weight: 500;
        }
        .ph-spark {
          display: block;
          width: 100%;
          height: auto;
          margin-top: 6px;
        }
        .ph-spark path {
          fill: none;
          stroke: var(--red);
          stroke-width: 1.5;
          stroke-linejoin: round;
        }
        .ph-spark circle {
          fill: var(--red);
        }

        /* bottom nav */
        .ph-nav {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;
          height: 60px;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          align-items: center;
          border-top: 1px solid var(--line-soft);
          border-radius: 0 0 30px 30px;
          background: var(--bg);
        }
        .ph-tab {
          position: relative;
          display: grid;
          place-items: center;
          height: 100%;
          font-size: 15px;
          color: var(--dim);
          transition: color 0.3s;
        }
        .ph-tab.on {
          color: var(--text);
        }
        .ph-tab-mark {
          position: absolute;
          top: 6px;
          width: 16px;
          height: 2px;
          border-radius: 2px;
          background: var(--red);
        }

        /* side */
        .ph-steps {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .ph-steps li + li {
          border-top: 1px solid var(--line-soft);
        }
        .ph-steps button {
          position: relative;
          display: grid;
          gap: 4px;
          width: 100%;
          padding: 16px 0;
          border: 0;
          background: none;
          text-align: left;
          cursor: pointer;
          color: var(--dim);
          transition: color 0.2s;
        }
        .ph-steps button:hover,
        .ph-steps button.cur {
          color: var(--text);
        }
        .ph-step-name {
          font-size: clamp(20px, 2.2vw, 26px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .ph-step-body {
          max-width: 460px;
          font-size: 15px;
          line-height: 1.55;
        }
        .ph-steps button:not(.cur) .ph-step-body {
          display: none;
        }
        .ph-steps button.cur .ph-step-body {
          color: var(--muted);
        }
        .ph-progress {
          position: absolute;
          left: 0;
          bottom: -1px;
          height: 1px;
          width: 100%;
          background: var(--red);
          transform-origin: left center;
          animation: ph-fill linear forwards;
        }
        @keyframes ph-fill {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}
