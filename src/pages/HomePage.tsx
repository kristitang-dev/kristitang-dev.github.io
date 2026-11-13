import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { Hero } from '../components/Hero/Hero'
import { About } from '../components/About/About'
import { Work } from '../components/Work/Work'
import { Research } from '../components/Research/Research'
import { Bookshelf } from '../components/Bookshelf/Bookshelf'
import {
  clearReturnOverlay,
  consumeReturnOverlay,
  useSpatialStore,
  type HomeLocationState,
} from '../store/spatialStore'

let homeHasMounted = false

export function HomePage() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    const state = location.state as HomeLocationState | null
    const firstHomeMount = !homeHasMounted
    homeHasMounted = true

    if (state?.overlay) {
      clearReturnOverlay()
      window.scrollTo(0, 0)
      useSpatialStore.getState().setActiveOverlay(state.overlay)
      return
    }

    // The first history entry keeps its default key, including when the
    // browser returns to it. Only a fresh load of the homepage should drop
    // a stored window; backing out of a detail page should reopen it.
    if (navigationType === 'POP') {
      if (firstHomeMount && location.key === 'default') {
        clearReturnOverlay()
      } else {
        const overlay = consumeReturnOverlay()
        if (overlay) {
          window.scrollTo(0, 0)
          useSpatialStore.getState().setActiveOverlay(overlay)
          return
        }
      }
    }

    const scrollTo = state?.scrollTo
    if (scrollTo) {
      requestAnimationFrame(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }
    window.scrollTo(0, 0)
  }, [location, navigationType])

  return (
    <>
      <Hero />
      <About />
      <Work />
      <Research />
      <Bookshelf />
    </>
  )
}
