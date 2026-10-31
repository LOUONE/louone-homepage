import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '../lib/data'
import { copyEmail, Toast } from './copy-email'

const commands = [
  { label: 'Home', hint: '/', href: '/' },
  { label: 'Work', hint: '/#work', href: '/#work' },
  { label: 'Experience', hint: '/#experience', href: '/#experience' },
  { label: 'Toolkit', hint: '/#toolkit', href: '/#toolkit' },
  { label: 'mailguard case study', hint: '/work/mailguard', href: '/work/mailguard' },
  { label: 'mailguard source', hint: 'github ↗', href: 'https://github.com/LOUONE/mailguard' },
  { label: 'Copy email address', hint: profile.email, action: 'copy-email' },
  { label: 'GitHub', hint: 'github ↗', href: profile.links.github },
  { label: 'LinkedIn', hint: 'linkedin ↗', href: profile.links.linkedin },
  { label: 'Photography', hint: 'flickr ↗', href: profile.links.flickr }
]

export default function CommandPalette({ open, setOpen }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [toast, setToast] = useState(false)
  const input = useRef(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? commands.filter(c => `${c.label} ${c.hint}`.toLowerCase().includes(q))
      : commands
  }, [query])

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => input.current?.focus())
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const run = cmd => {
    if (!cmd) return
    setOpen(false)
    if (cmd.action === 'copy-email') {
      copyEmail().then(ok => {
        if (!ok) return
        setToast(true)
        setTimeout(() => setToast(false), 1800)
      })
    } else if (cmd.href.startsWith('http')) {
      window.open(cmd.href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(cmd.href)
    }
  }

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => (i + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => (i - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter') {
      run(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <>
    <Toast show={toast}>Email copied to clipboard</Toast>
    <AnimatePresence>
      {open && (
        <motion.div
          className="palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={e => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="palette-input">
              <span aria-hidden>❯</span>
              <input
                ref={input}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
              />
            </div>
            {results.length ? (
              <ul id="palette-list" role="listbox">
                {results.map((c, i) => (
                  <li
                    key={c.label}
                    id={`cmd-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(c)}
                  >
                    {c.label}
                    <small>{c.hint}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="palette-empty">command not found: {query}</div>
            )}
            <div className="palette-foot">
              <span>
                <kbd>↑</kbd> <kbd>↓</kbd> navigate
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              <span>
                <kbd>esc</kbd> close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
