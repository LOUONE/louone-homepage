import { useEffect, useRef } from 'react'

// 4x4 ordered-dither thresholds
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16)
// Each cell is drawn as a SUB x SUB block of canvas pixels, upscaled with image-rendering: pixelated
const SUB = 4
const BG = [11, 11, 12]

const pack = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0

/**
 * Renders a painting as a field of dithered dots. Around the pointer (or a slow
 * drifting point when there is none) the dots grow back into full pixels, so
 * moving over the canvas "restores" the picture.
 */
export default function Dither({ src, cell = 6, radius = 150, className = '' }) {
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
    let buf = null
    let u32 = null
    let raf = 0
    let visible = true
    const start = performance.now()
    const pointer = { x: 0, y: 0, active: false }
    const lens = { x: el.clientWidth * 0.6, y: el.clientHeight * 0.4, r: 0 }

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
      buf = ctx.createImageData(cv.width, cv.height)
      u32 = new Uint32Array(buf.data.buffer)
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
        ty = el.clientHeight * (0.4 + 0.18 * Math.sin(t * 0.23 + 1))
        tr = radius * 0.75
      }
      const ease = reduce ? 1 : 0.1
      lens.x += (tx - lens.x) * ease
      lens.y += (ty - lens.y) * ease
      lens.r += (tr - lens.r) * ease

      const W = cols * SUB
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4
          const r = colors[i]
          const g = colors[i + 1]
          const b = colors[i + 2]
          const th = BAYER[(x & 3) + ((y & 3) << 2)]

          // Diagonal sweep in from the bottom-left on first paint
          const gate = (x / cols) * 0.6 + (1 - y / rows) * 0.4 + th * 0.3
          let k = 0
          let c = bg
          let gap = bg
          if (gate < reveal) {
            const dx = x * cell + cell / 2 - lens.x
            const dy = y * cell + cell / 2 - lens.y
            const d = Math.sqrt(dx * dx + dy * dy)
            const near = d < lens.r ? Math.min(1, (1 - d / lens.r) * 2.5) : 0
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            const wobble = reduce ? 0 : 0.4 * Math.sin(t * 1.1 + x * 0.19 + y * 0.13)
            k = Math.min(3, Math.max(1, Math.floor(lum * 2.4 + th * 1.6 + wobble)))
            if (near > 0.5) k = 4

            // Dots keep the painting's colour (slightly saturated); the gaps are a
            // darker shade of the same colour that lifts back to full inside the lens
            const sat = 1.25 - 0.25 * near
            const rr = Math.min(255, lum * 255 + (r - lum * 255) * sat)
            const gg = Math.min(255, lum * 255 + (g - lum * 255) * sat)
            const bb = Math.min(255, lum * 255 + (b - lum * 255) * sat)
            c = pack(rr | 0, gg | 0, bb | 0)
            const dark = 0.32 + 0.68 * near
            gap = pack((rr * dark) | 0, (gg * dark) | 0, (bb * dark) | 0)
          }
          const o0 = (SUB - k) >> 1
          const base = y * SUB * W + x * SUB
          for (let sy = 0; sy < SUB; sy++) {
            const row = base + sy * W
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

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) kick()
    })
    io.observe(el)

    let resizeTimer
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        sample()
        requestAnimationFrame(draw)
      }, 80)
    })
    ro.observe(el)

    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      img = image
      sample()
      kick()
      if (reduce) requestAnimationFrame(draw)
    }
    image.src = src

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [src, cell, radius])

  return (
    <div ref={wrap} className={`dither ${className}`} aria-hidden>
      <canvas ref={canvas} />
    </div>
  )
}
