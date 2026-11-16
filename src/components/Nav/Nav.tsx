import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearReturnOverlay, dismissGallery, useSpatialStore } from '../../store/spatialStore'
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
  const overlay = useSpatialStore((state) => state.activeOverlay)
  const covered = scrolled || !isHome || overlay !== null

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
    <header className={`nav${covered ? ' nav--scrolled' : ''}${overlay ? ' nav--overlay' : ''}`}>
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
        {overlay && (
          <button type="button" className="nav__close" aria-label="Close" onClick={dismissGallery}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8" />
            </svg>
          </button>
        )}
      </nav>
    </header>
  )
}
