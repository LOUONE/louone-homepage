import { motion } from 'framer-motion'

export const Reveal = ({ children, delay = 0, as = 'div', ...props }) => {
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const Terminal = ({ title, children }) => (
  <div className="term">
    <div className="term-bar">
      <i />
      <i />
      <i />
      <span>{title}</span>
    </div>
    {children}
  </div>
)
