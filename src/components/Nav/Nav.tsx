import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { site } from '../../data/site'
import { clearReturnOverlay, dismissGallery, useSpatialStore } from '../../store/spatialStore'
import './Nav.css'

const LINKS = [
  { label: 'Work', section: 'work' },
  { label: 'Research', section: 'research' },
  { label: 'About', section: 'about' },
] as const

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const goToSection = (section: string) => {
    setMenuOpen(false)
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

        <div className="nav__menu" ref={menuRef}>
          <button
            type="button"
            className="nav__toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="nav-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d={menuOpen ? 'M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8' : 'M2 5h12M2 11h12'} />
            </svg>
          </button>

          <ul className={`nav__links${menuOpen ? ' is-open' : ''}`} id="nav-links">
            {LINKS.map(({ label, section }) => (
              <li key={label}>
                <button type="button" className="nav__link" onClick={() => goToSection(section)}>
                  {label}
                </button>
              </li>
            ))}
            {site.cvUrl && (
              <li>
                <a
                  className="nav__link"
                  href={site.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  CV
                </a>
              </li>
            )}
          </ul>
        </div>
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
