import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { Hero } from '../components/Hero/Hero'
import { About } from '../components/About/About'
import { Work } from '../components/Work/Work'
import { Research } from '../components/Research/Research'
import { Bookshelf } from '../components/Bookshelf/Bookshelf'
import {
  clearReturnOverlay,
  consumeReturnPlace,
  useSpatialStore,
  type HomeLocationState,
} from '../store/spatialStore'

let homeHasMounted = false

export function HomePage() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const appliedInstruction = useRef<string | null>(null)

  useLayoutEffect(() => {
    const state = location.state as HomeLocationState | null
    const firstHomeMount = !homeHasMounted
    homeHasMounted = true

    const scrollToSection = (id: string) => {
      useSpatialStore.getState().closeOverlay()
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'start',
        })
      })
    }

    // Drop the instruction after it runs once. Otherwise a later history
    // update, such as opening the project window, applies it again.
    const forgetInstruction = () => {
      window.setTimeout(() => {
        const current = window.history.state
        if (!current?.usr) return
        if (!('scrollTo' in current.usr) && !('overlay' in current.usr)) return
        const usr = { ...current.usr }
        delete usr.scrollTo
        delete usr.overlay
        window.history.replaceState({ ...current, usr }, '')
      }, 0)
    }

    const instruction = state?.overlay
      ? `overlay:${location.key}:${state.overlay}`
      : state?.scrollTo
        ? `scroll:${location.key}:${state.scrollTo}`
        : null
    if (instruction && appliedInstruction.current === instruction) return

    if (state?.overlay) {
      appliedInstruction.current = instruction
      clearReturnOverlay()
      forgetInstruction()
      window.scrollTo(0, 0)
      useSpatialStore.getState().setActiveOverlay(state.overlay)
      return
    }

    if (state?.scrollTo) {
      appliedInstruction.current = instruction
      clearReturnOverlay()
      forgetInstruction()
      scrollToSection(state.scrollTo)
      return
    }

    // The first history entry keeps its default key, including when the
    // browser returns to it. Only a fresh load of the homepage should drop
    // a stored destination; backing out of a detail page should restore it.
    if (navigationType === 'POP') {
      if (firstHomeMount && location.key === 'default') {
        clearReturnOverlay()
      } else {
        const place = consumeReturnPlace()
        if (place?.kind === 'overlay') {
          window.scrollTo(0, 0)
          useSpatialStore.getState().setActiveOverlay(place.overlay)
          return
        }
        if (place?.kind === 'section') {
          scrollToSection(place.section)
          return
        }
      }
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
