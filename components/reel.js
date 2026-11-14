import { useEffect, useRef, useState } from 'react'

/*
 * A short looping product video. It plays muted only while it is on screen,
 * and with reduced motion it stays on its poster until the viewer presses play.
 */
const Reel = ({ src, poster, label, ratio = '16 / 9', priority = false }) => {
  const ref = useRef(null)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false

    const sync = () => {
      setStill(media.matches)
      if (media.matches) return video.pause()
      if (visible) video.play().catch(() => {})
      else video.pause()
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0.25 }
    )
    io.observe(video)
    media.addEventListener('change', sync)
    return () => {
      io.disconnect()
      media.removeEventListener('change', sync)
    }
  }, [])

  return (
    <div className="reel" style={{ aspectRatio: ratio }}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        poster={poster}
        controls={still}
        aria-label={label}
      >
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>
    </div>
  )
}

export default Reel
