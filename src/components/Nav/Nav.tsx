import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearReturnOverlay, useSpatialStore, type OverlayType } from '../../store/spatialStore'
import './Nav.css'

const LINKS = [
  { label: 'Work', overlay: 'laptop' },
  { label: 'Research', overlay: 'bookshelf' },
  { label: 'About', overlay: null },
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

  const openOverlay = (overlay: OverlayType) => {
    if (!isHome) navigate('/')
    else window.scrollTo({ top: 0, behavior: 'auto' })
    useSpatialStore.getState().setActiveOverlay(overlay)
  }

  const goToAbout = () => {
    if (isHome) {
      useSpatialStore.getState().scrollToAbout()
      return
    }
    useSpatialStore.getState().closeOverlay()
    navigate('/', { state: { scrollTo: 'about' } })
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
          {LINKS.map(({ label, overlay }) => (
            <li key={label}>
              <button
                type="button"
                className="nav__link"
                onClick={() => (overlay ? openOverlay(overlay) : goToAbout())}
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
