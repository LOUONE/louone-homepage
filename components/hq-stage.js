import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/*
 * The real HQ app (a sanitized demo build in /public/hq-demo, fictional data) running
 * in an iframe, directed like a product film: a scripted cursor arcs to real elements
 * and clicks them, a camera pushes in on what matters and pulls back, and the loop
 * ends where it began. Visitors can take the controls at any time.
 *
 * Same-origin iframe, so the director measures and clicks the app's own DOM: nothing
 * is redrawn, every frame is the actual product.
 */

const SRC = '/hq-demo/index.html'
const W = 1440
const H = 900
const START = { x: 1180, y: 760 }

const BEATS = [
  { key: 'brief', caption: 'Every morning the team prepares a brief: agenda, mail to handle, news worth reading, markets.' },
  { key: 'market', caption: 'Each market line opens its own analysis: trend, breakout level and where the idea stops being valid.' },
  { key: 'ask', caption: 'One sentence to Maestro, the orchestrator. It asks the right teammate and shows which tools it used.' },
  { key: 'projects', caption: 'Code work runs in throwaway cloud sessions. Every change comes back as a pull request I approve.' },
  { key: 'system', caption: 'Running costs, scheduled tasks and a paper-trading bot, on one screen.' }
]

class Stop extends Error {}

const sleep = ms => new Promise(r => setTimeout(r, ms))
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function HqStage({ phoneShot }) {
  const stage = useRef(null)
  const frame = useRef(null)
  const camera = useRef(null)
  const cursor = useRef(null)
  const ripple = useRef(null)
  const run = useRef(0)
  const visible = useRef(true)
  const pos = useRef({ ...START })
  const zoom = useRef(1)

  const [scale, setScale] = useState(0)
  const [narrow, setNarrow] = useState(false)
  const [beat, setBeat] = useState(-1)
  const [mode, setMode] = useState('tour') // tour | free | still
  const [ready, setReady] = useState(false)

  /* ---------- layout ---------- */
  useEffect(() => {
    const el = stage.current
    const measure = w => {
      if (!w) return
      setScale(w / W)
      setNarrow(w < 640)
    }
    // Measure right away, then follow resizes
    measure(el.clientWidth)
    const ro = new ResizeObserver(([e]) => measure(e.contentRect.width))
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMode('free')
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  /* ---------- camera ---------- */
  const setCamera = useCallback(
    (rect, z = 1) => {
      const k = scale
      zoom.current = z
      if (!camera.current) return
      if (!rect || z === 1) {
        camera.current.style.transform = `translate(0px, 0px) scale(${k})`
      } else {
        const cx = rect.x + rect.width / 2
        const cy = rect.y + rect.height / 2
        const sw = W * k
        const sh = H * k
        let tx = sw / 2 - k * z * cx
        let ty = sh / 2 - k * z * cy
        tx = Math.min(0, Math.max(sw - k * z * W, tx))
        ty = Math.min(0, Math.max(sh - k * z * H, ty))
        camera.current.style.transform = `translate(${tx}px, ${ty}px) scale(${k * z})`
      }
      // The cursor and ripple live in design space; this keeps them a constant size on screen
      const kz = String((!rect || z === 1 ? 1 : z) * k)
      cursor.current && cursor.current.style.setProperty('--kz', kz)
      ripple.current && ripple.current.style.setProperty('--kz', kz)
    },
    [scale]
  )

  useEffect(() => {
    setCamera(null, 1)
  }, [scale, setCamera])

  /* ---------- the director ---------- */
  useEffect(() => {
    if (mode !== 'tour' || narrow || !scale) return
    const id = ++run.current
    const alive = () => {
      if (run.current !== id) throw new Stop()
    }
    const wait = async ms => {
      const end = Date.now() + ms
      while (Date.now() < end) {
        alive()
        await sleep(Math.min(120, end - Date.now()))
        while (!visible.current || document.hidden) {
          alive()
          await sleep(250)
        }
      }
    }

    const doc = () => frame.current && frame.current.contentDocument
    const find = async (pick, timeout = 4000) => {
      const end = Date.now() + timeout
      for (;;) {
        alive()
        const d = doc()
        const el = d && pick(d)
        if (el) return el
        if (Date.now() > end) throw new Stop()
        await sleep(100)
      }
    }
    const rectOf = el => {
      const r = el.getBoundingClientRect()
      return { x: r.left, y: r.top, width: r.width, height: r.height }
    }

    const moveTo = async (x, y) => {
      const from = { ...pos.current }
      const dx = x - from.x
      const dy = y - from.y
      const dist = Math.hypot(dx, dy)
      const dur = Math.max(450, Math.min(1100, dist * 0.9))
      // Shallow arc: control point pushed sideways from the midpoint
      const cx = from.x + dx / 2 - dy * 0.14
      const cy = from.y + dy / 2 + dx * 0.14
      const t0 = performance.now()
      await new Promise(resolve => {
        const step = now => {
          if (run.current !== id) return resolve()
          const t = ease(Math.min(1, (now - t0) / dur))
          const u = 1 - t
          const px = u * u * from.x + 2 * u * t * cx + t * t * x
          const py = u * u * from.y + 2 * u * t * cy + t * t * y
          pos.current = { x: px, y: py }
          if (cursor.current) cursor.current.style.translate = `${px}px ${py}px`
          if (t < 1) requestAnimationFrame(step)
          else resolve()
        }
        requestAnimationFrame(step)
      })
      alive()
    }

    const press = async el => {
      const c = cursor.current
      const r = ripple.current
      if (r) {
        r.style.translate = `${pos.current.x}px ${pos.current.y}px`
        r.classList.remove('go')
        void r.offsetWidth
        r.classList.add('go')
      }
      c && c.classList.add('down')
      await wait(140)
      el.click()
      c && c.classList.remove('down')
      await wait(160)
    }

    const clickOn = async (pick, at = 0.5) => {
      const el = await find(pick)
      const r = rectOf(el)
      await moveTo(r.x + r.width * at, r.y + r.height / 2)
      await press(el)
    }

    // pick may return one element or several: the camera frames their union
    const pushIn = async (pick, maxZ = 1.8, { left = 1 } = {}) => {
      const found = await find(d => {
        const p = pick(d)
        return Array.isArray(p) ? (p.length && p.every(Boolean) ? p : null) : p
      })
      const rects = (Array.isArray(found) ? found : [found]).map(rectOf)
      const x = Math.min(...rects.map(q => q.x))
      const y = Math.min(...rects.map(q => q.y))
      const r = {
        x,
        y,
        // left < 1 frames only the left part of a wide element (text starts there)
        width: (Math.max(...rects.map(q => q.x + q.width)) - x) * left,
        height: Math.max(...rects.map(q => q.y + q.height)) - y
      }
      const z = Math.min(maxZ, (0.86 * W) / r.width, (0.82 * H) / r.height)
      setCamera(r, Math.max(1, z))
      await wait(1150)
    }
    const pullBack = async () => {
      setCamera(null, 1)
      await wait(900)
    }

    const reload = async () => {
      setReady(false)
      await wait(260)
      const f = frame.current
      await new Promise(resolve => {
        f.addEventListener('load', resolve, { once: true })
        f.src = `${SRC}?t=${Date.now()}#/accueil`
      })
      await find(d => d.querySelector('.accueil-section'))
      setReady(true)
      await wait(1400)
    }

    const tour = async () => {
      for (;;) {
        await reload()
        setCamera(null, 1)

        // 1. The brief
        setBeat(0)
        await pushIn(d => [...d.querySelectorAll('.accueil-carte')].slice(0, 2), 1.6)
        await wait(2600)
        await pullBack()

        // 2. Market analysis
        setBeat(1)
        await clickOn(d => [...d.querySelectorAll('.accueil-marche-bouton')].find(b => /CW8/.test(b.textContent)), 0.3)
        await wait(500)
        await pushIn(d => [...d.querySelectorAll('.accueil-carte')].find(c => /Marché/.test(c.textContent)), 1.9)
        await wait(3000)
        await pullBack()

        // 3. Ask Maestro
        setBeat(2)
        await clickOn(d => [...d.querySelectorAll('.capsule.raccourci')].find(b => /Point du jour/.test(b.textContent)))
        await find(d => /employe\/chef/.test(d.location.hash) && d.querySelector('.accueil-demande-champ, textarea, input'))
        await wait(2600)
        // "Ce qu'il fait": the tools behind the last answer, a <details> in the app
        const tools = await find(d => {
          const all = [...d.querySelectorAll('#contenu details.conv-outils')]
          return all[all.length - 1]
        }, 6000).catch(() => null)
        if (tools) {
          const summary = tools.querySelector('summary') || tools
          const r = rectOf(summary)
          await moveTo(r.x + 40, r.y + r.height / 2)
          await press(summary)
          await wait(450)
          await pushIn(() => tools.parentElement, 1.7)
        }
        await wait(2800)
        await pullBack()

        // 4. Projects
        setBeat(3)
        await clickOn(d => d.querySelector('nav a[href="#/chantiers"]'))
        await wait(900)
        await pushIn(d => d.querySelector('#contenu .carte'), 1.6, { left: 0.62 })
        await wait(2800)
        await pullBack()

        // 5. System
        setBeat(4)
        await clickOn(d => d.querySelector('nav a[href="#/systeme"]'))
        await wait(1100)
        await pushIn(d => [...d.querySelectorAll('#contenu .carte')].find(c => /Dépense/i.test(c.textContent)) || d.querySelector('#contenu .carte'), 1.6)
        await wait(2600)
        await pullBack()

        // Back to where it began: home, cursor at rest
        await clickOn(d => d.querySelector('nav a[href="#/accueil"]'))
        await moveTo(START.x, START.y)
        await wait(600)
      }
    }

    tour().catch(e => {
      if (!(e instanceof Stop)) console.error(e)
    })
    // Bumping the counter is what stops this run: every await checks it
    const counter = run
    return () => {
      counter.current++
    }
  }, [mode, narrow, scale, setCamera])

  const takeControls = () => {
    run.current++
    setMode('free')
    setBeat(-1)
    setCamera(null, 1)
    setReady(true)
  }
  const replay = () => {
    pos.current = { ...START }
    setMode('tour')
  }

  /* ---------- phones: the app itself at phone size, hands-on ---------- */
  if (narrow) {
    return (
      <div ref={stage} className="hq-stage hq-stage--phone">
        <PhoneFrame />
        <p className="hq-stage-note">Live demo, fictional data. Tap around.</p>
      </div>
    )
  }

  return (
    <div className="hq-stage-wrap">
      <div ref={stage} className={`hq-stage ${mode}`} style={{ height: scale ? H * scale : undefined }}>
        <div className="hq-viewport">
        <div ref={camera} className="hq-camera" style={{ width: W, height: H }}>
          <iframe
            ref={frame}
            title="HQ, live demo with fictional data"
            src={`${SRC}#/accueil`}
            width={W}
            height={H}
            tabIndex={mode === 'free' ? 0 : -1}
            onLoad={() => mode === 'free' && setReady(true)}
            style={{ pointerEvents: mode === 'free' ? 'auto' : 'none', opacity: ready || mode === 'free' ? 1 : 0 }}
          />
          {mode === 'tour' && (
            <>
              <span ref={ripple} className="hq-ripple" />
              <svg
                ref={cursor}
                className="hq-cursor"
                style={{ translate: `${START.x}px ${START.y}px` }}
                width="26"
                height="26"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  d="M4 2.5 19.5 13l-6.6 1.3 3.9 7.2-2.7 1.4-3.9-7.2L5.4 20z"
                  fill="#fff"
                  stroke="#14123a"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </div>
        </div>
        {mode === 'tour' && (
          <button className="hq-stage-hit" onClick={takeControls} aria-label="Stop the tour and use the demo yourself" />
        )}
        {phoneShot && (
          <div className="hq-satellite" aria-hidden>
            <Image src={phoneShot} alt="" width={1179} height={1977} sizes="220px" />
          </div>
        )}
      </div>

      <div className="hq-stage-bar">
        {mode === 'tour' ? (
          <>
            <ol className="hq-steps" aria-hidden>
              {BEATS.map((b, i) => (
                <li key={b.key} className={i === beat ? 'on' : i < beat ? 'done' : ''} />
              ))}
            </ol>
            <p className="hq-caption" aria-live="polite" key={beat}>
              {beat >= 0 ? BEATS[beat].caption : 'Loading the live demo…'}
            </p>
            <button className="link" onClick={takeControls}>
              Take the controls
            </button>
          </>
        ) : (
          <>
            <p className="hq-caption">
              It is yours: click around the real app. Every name, number and message is made up.
            </p>
            <button className="link" onClick={replay}>
              Replay the tour
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const PW = 393
const PH = 852

function PhoneFrame() {
  const box = useRef(null)
  const [k, setK] = useState(0)
  useEffect(() => {
    setK(box.current.clientWidth / PW)
    const ro = new ResizeObserver(([e]) => e.contentRect.width && setK(e.contentRect.width / PW))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="hq-phone-frame">
      <div ref={box} className="hq-phone-screen" style={{ height: k ? PH * k : undefined }}>
        {k > 0 && (
          <iframe
            title="HQ, live demo with fictional data"
            src={`${SRC}#/accueil`}
            width={PW}
            height={PH}
            style={{ transform: `scale(${k})`, transformOrigin: '0 0' }}
          />
        )}
      </div>
    </div>
  )
}
