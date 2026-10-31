import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import Layout from '../components/layout'
import '../styles/globals.css'

export default function Website({ Component, pageProps, router }) {
  return (
    <MotionConfig reducedMotion="user">
      <Layout>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.route}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </Layout>
      <Analytics />
    </MotionConfig>
  )
}
