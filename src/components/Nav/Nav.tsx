import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Nav.css'

const LINKS = [
  { label: 'Work', section: 'work' },
  { label: 'Research', section: 'research' },
  { label: 'Garden', section: 'garden' },
  { label: 'About', section: 'about' },
] as const

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goToSection = (section: string) => {
    if (isHome) {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    navigate('/', { state: { scrollTo: section } })
  }

  return (
    <header className={`nav${scrolled || !isHome ? ' nav--scrolled' : ''}`}>
      <nav className="nav__inner" aria-label="Main">
        <Link
          to="/"
          className="nav__brand"
          onClick={() => {
            if (isHome) {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          Kristi Tang
        </Link>

        <ul className="nav__links">
          {LINKS.map(({ label, section }) => (
            <li key={section}>
              <button
                type="button"
                className="nav__link"
                onClick={() => goToSection(section)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
