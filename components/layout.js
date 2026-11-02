import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CommandPalette from './command-palette'
import { profile, paintings } from '../lib/data'

const Nav = ({ onOpenPalette }) => {
  const [scrolled, setScrolled] = useState(false)
  const [mac, setMac] = useState(true)
  // On the home page the name is already painted into the hero, so the
  // brand only fades in once you scroll past it
  const solid = useRouter().pathname !== '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${solid ? 'solid' : ''}`}>
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Home">
          Louis Forrer
        </Link>
        <nav className="nav-links">
          <Link href="/#work">Work</Link>
          <Link href="/#experience" className="hide-sm">
            Experience
          </Link>
          <Link href="/#contact" className="hide-sm">
            Contact
          </Link>
          <button className="kbd-btn" onClick={onOpenPalette} aria-label="Open command menu">
            <kbd>{mac ? '⌘' : 'Ctrl'}</kbd>
            <kbd>K</kbd>
          </button>
        </nav>
      </div>
    </header>
  )
}

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <span>© {new Date().getFullYear()} {profile.name}, Geneva</span>
      <span>Paintings by Ferdinand Hodler (public domain). Set in Schibsted Grotesk.</span>
      <span>
        <a href={profile.links.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        {' · '}
        <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </span>
    </div>
  </footer>
)

export default function Layout({ children }) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta
          name="description"
          content="Louis Forrer, Geneva. Cybersecurity and AI at EY Switzerland, and software built in Python and TypeScript."
        />
        <link rel="preload" as="image" href={paintings.hero.src} />
      </Head>
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <main>{children}</main>
      <Footer />
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
    </>
  )
}
