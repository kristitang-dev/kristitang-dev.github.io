import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearReturnOverlay, useSpatialStore } from '../../store/spatialStore'
import './Nav.css'

const LINKS = [
  { label: 'Work', section: 'work' },
  { label: 'Research', section: 'research' },
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
      useSpatialStore.getState().scrollToSection(section)
      return
    }
    useSpatialStore.getState().closeOverlay()
    navigate('/', { state: { scrollTo: section } })
  }

  return (
    <header className={`nav${scrolled || !isHome ? ' nav--scrolled' : ''}`}>
      <nav className="nav__inner" aria-label="Main">
        <Link
          to="/"
          className="nav__brand"
          onClick={() => {
            clearReturnOverlay()
            useSpatialStore.getState().closeOverlay()
            if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          Kristi Tang
        </Link>

        <ul className="nav__links">
          {LINKS.map(({ label, section }) => (
            <li key={label}>
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
