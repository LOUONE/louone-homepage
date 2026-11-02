import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '../lib/data'

export const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(profile.email)
    return true
  } catch {
    return false
  }
}

export const Toast = ({ show, children }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="toast"
        role="status"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

export default function CopyEmail({ className = '', label = profile.email }) {
  const [copied, setCopied] = useState(false)

  const onClick = async () => {
    if (await copyEmail()) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } else {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        data-copied={copied}
        onClick={onClick}
        title="Copy email address"
      >
        {label}
      </button>
      <Toast show={copied}>Email copied to clipboard</Toast>
    </>
  )
}
