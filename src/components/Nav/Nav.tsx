import { useEffect, useState } from 'react'
import './Nav.css'

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
] as const

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <nav className="nav__inner" aria-label="Main">
        <a href="#home" className="nav__brand">
          KT
        </a>

        <ul className="nav__links">
          {LINKS.map(({ label, href }) => (
            <li key={href}>
              <a href={href} className="nav__link">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
