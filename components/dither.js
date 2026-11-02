import { useEffect, useRef } from 'react'

// 4x4 ordered-dither thresholds
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16)
// Each cell is drawn as a SUB x SUB block of canvas pixels, upscaled with image-rendering: pixelated
const SUB = 4
const BG = [10, 10, 10]
// Must match .container in globals.css so the lettering lines up with the page grid
const MAX_WIDTH = 1280
const FONT = 'Schibsted Grotesk'

const pack = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

/**
 * Renders a painting as a field of dithered dots. Around the pointer (or a slow
 * drifting point when there is none) the dots grow back into full pixels.
 *
 * With `text`, the letters are drawn out of the painting itself: cells inside
 * the glyphs show the painting at full strength, the rest stays dim and dotted.
 * `textCenter` centres the lettering vertically instead of using `textTop`.
 * With `dissolve`, the field breaks apart into dots as it scrolls out of view.
 */
export default function Dither({
  src,
  cell = 6,
  radius = 150,
  text = '',
  textTop = 96,
  textCenter = false,
  dissolve = false,
  className = ''
}) {
  const wrap = useRef(null)
  const canvas = useRef(null)

  useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const bg = pack(...BG)

    let img = null
    let cols = 0
    let rows = 0
    let colors = null
    let noise = null
    let mask = null
    let buf = null
    let u32 = null
    let raf = 0
    let visible = true
    let alive = true
    const start = performance.now()
    const pointer = { x: 0, y: 0, active: false }
    const lens = { x: el.clientWidth * 0.6, y: el.clientHeight * 0.45, r: 0 }

    const buildMask = async () => {
      mask = null
      if (!text) return
      try {
        await document.fonts.load(`800 64px "${FONT}"`)
      } catch {}
      if (!alive || !cols) return

      const w = el.clientWidth
      const gutter = clamp(w * 0.04, 16, 40)
      const left = Math.max(gutter, (w - MAX_WIDTH) / 2 + gutter)
      const avail = (Math.min(w, MAX_WIDTH) - gutter * 2) / cell
      const lines = avail < 110 ? text.split(' ') : [text]

      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const c = off.getContext('2d')
      const setFont = size => {
        c.font = `800 ${size}px "${FONT}", system-ui, sans-serif`
        if ('letterSpacing' in c) c.letterSpacing = `${-0.015 * size}px`
      }
      setFont(100)
      const widest = Math.max(...lines.map(l => c.measureText(l).width))
      const size = (100 * avail) / widest
      setFont(size)
      c.fillStyle = '#fff'
      c.textBaseline = 'alphabetic'
      const x0 = left / cell
      const capH = size * 0.74
      const blockH = capH + (lines.length - 1) * size * 0.84
      const y0 = (textCenter ? (rows - blockH) / 2 : textTop / cell) + capH
      lines.forEach((l, i) => c.fillText(l, x0, y0 + i * size * 0.84))

      const d = c.getImageData(0, 0, cols, rows).data
      const m = new Uint8Array(cols * rows)
      for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0
      mask = m
    }

    const sample = () => {
      if (!img) return
      const w = el.clientWidth
      const h = el.clientHeight
      cols = Math.max(1, Math.ceil(w / cell))
      rows = Math.max(1, Math.ceil(h / cell))
      cv.width = cols * SUB
      cv.height = rows * SUB
      cv.style.width = `${cols * cell}px`
      cv.style.height = `${rows * cell}px`

      // Cover-fit the painting into one pixel per cell
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const o = off.getContext('2d')
      const s = Math.max(cols / img.width, rows / img.height)
      const dw = img.width * s
      const dh = img.height * s
      o.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh)
      colors = o.getImageData(0, 0, cols, rows).data

      noise = new Float32Array(cols * rows)
      for (let i = 0; i < noise.length; i++) {
        const x = i % cols
        const y = (i / cols) | 0
        noise[i] = (((x * 73856093) ^ (y * 19349663)) & 1023) / 1023
      }

      buf = ctx.createImageData(cv.width, cv.height)
      u32 = new Uint32Array(buf.data.buffer)
      buildMask().then(() => requestAnimationFrame(draw))
    }

    const draw = now => {
      if (!colors) return
      const t = (now - start) / 1000
      const reveal = reduce ? 2 : Math.min(2, (t / 1.8) * 2)

      let tx, ty, tr
      if (pointer.active) {
        tx = pointer.x
        ty = pointer.y
        tr = radius
      } else {
        tx = el.clientWidth * (0.55 + 0.3 * Math.sin(t * 0.17))
        ty = el.clientHeight * (0.5 + 0.18 * Math.sin(t * 0.23 + 1))
        tr = radius * 0.75
      }
      const ease = reduce ? 1 : 0.1
      lens.x += (tx - lens.x) * ease
      lens.y += (ty - lens.y) * ease
      lens.r += (tr - lens.r) * ease

      let gone = 0
      if (dissolve) {
        const rect = el.getBoundingClientRect()
        gone = clamp(-rect.top / (rect.height * 0.85), 0, 1)
      }
      const lettered = !!mask

      const W = cols * SUB
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x
          const i = idx * 4
          const r = colors[i]
          const g = colors[i + 1]
          const b = colors[i + 2]
          const th = BAYER[(x & 3) + ((y & 3) << 2)]
          const inText = lettered && mask[idx] === 1

          // Diagonal sweep in from the bottom-left on first paint
          const gate = (x / cols) * 0.6 + (1 - y / rows) * 0.4 + th * 0.3
          // Cells drop out in a dithered order as the section scrolls away;
          // the lettering holds on longer than the field around it
          const drop = inText ? 0.55 + th * 0.35 + noise[idx] * 0.1 : th * 0.6 + noise[idx] * 0.4
          let k = 0
          let c = bg
          let gap = bg
          if (gate < reveal && drop >= gone * 1.25) {
            const dx = x * cell + cell / 2 - lens.x
            const dy = y * cell + cell / 2 - lens.y
            const d = Math.sqrt(dx * dx + dy * dy)
            const near = d < lens.r ? Math.min(1, (1 - d / lens.r) * 2.5) : 0
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255

            let shade, dark
            if (inText) {
              k = 4
              shade = 1.1
              dark = 1
            } else {
              const wobble = reduce ? 0 : 0.4 * Math.sin(t * 1.1 + x * 0.19 + y * 0.13)
              k = Math.min(3, Math.max(1, Math.floor(lum * 2.4 + th * 1.6 + wobble)))
              if (near > 0.5) k = 4
              // With lettering the field stays dim so the letters read; the lens lifts it
              shade = lettered ? 0.5 + 0.45 * near : 1
              dark = lettered ? 0.25 + 0.6 * near : 0.32 + 0.68 * near
            }

            // Slightly saturate so the dots keep Hodler's colour
            const sat = inText ? 1.15 : 1.25 - 0.25 * near
            const base = lum * 255
            const rr = clamp((base + (r - base) * sat) * shade, 0, 255)
            const gg = clamp((base + (g - base) * sat) * shade, 0, 255)
            const bb = clamp((base + (b - base) * sat) * shade, 0, 255)
            c = pack(rr | 0, gg | 0, bb | 0)
            gap = pack((rr * dark) | 0, (gg * dark) | 0, (bb * dark) | 0)
          }

          const o0 = (SUB - k) >> 1
          const rowBase = y * SUB * W + x * SUB
          for (let sy = 0; sy < SUB; sy++) {
            const row = rowBase + sy * W
            const inY = sy >= o0 && sy < o0 + k
            for (let sx = 0; sx < SUB; sx++) {
              u32[row + sx] = inY && sx >= o0 && sx < o0 + k ? c : gap
            }
          }
        }
      }
      ctx.putImageData(buf, 0, 0)
    }

    const loop = now => {
      draw(now)
      raf = visible && !reduce ? requestAnimationFrame(loop) : 0
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop)
    }

    const onMove = e => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      pointer.active = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
      pointer.x = x
      pointer.y = y
      if (reduce) requestAnimationFrame(draw)
    }
    const onLeave = () => {
      pointer.active = false
    }
    const onScroll = () => {
      if (reduce && dissolve) requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) kick()
    })
    io.observe(el)

    let resizeTimer
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(sample, 80)
    })
    ro.observe(el)

    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      img = image
      sample()
      kick()
    }
    image.src = src

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [src, cell, radius, text, textTop, textCenter, dissolve])

  return (
    <div ref={wrap} className={`dither ${className}`} aria-hidden>
      <canvas ref={canvas} />
    </div>
  )
}
