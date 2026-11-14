import { useLocation } from 'react-router-dom'
import { create } from 'zustand'

export type OverlayType = 'laptop' | 'bookshelf' | 'camera' | null

export type HomeLocationState = {
  scrollTo?: string
  overlay?: Exclude<OverlayType, null>
}

/** Where a visitor was before they opened a project. */
export type ReturnPlace =
  | { kind: 'overlay'; overlay: Exclude<OverlayType, null> }
  | { kind: 'section'; section: string }

const RETURN_OVERLAY_KEY = 'spatial-return-overlay'
const RETURN_PLACE_KEY = 'spatial-return-place'

function isOverlay(value: unknown): value is Exclude<OverlayType, null> {
  return value === 'laptop' || value === 'bookshelf' || value === 'camera'
}

export function isReturnPlace(value: unknown): value is ReturnPlace {
  if (!value || typeof value !== 'object') return false
  const place = value as ReturnPlace
  if (place.kind === 'overlay') return isOverlay(place.overlay)
  if (place.kind === 'section') return typeof place.section === 'string' && place.section.length > 0
  return false
}

function readStoredPlace(): { path: string; place: ReturnPlace } | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(RETURN_PLACE_KEY) ?? 'null') as {
      path?: unknown
      place?: unknown
    } | null
    if (!stored || typeof stored.path !== 'string' || !isReturnPlace(stored.place)) return null
    return { path: stored.path, place: stored.place }
  } catch {
    return null
  }
}

/** Remember where this detail page should send the visitor back. */
export function rememberReturnPlace(path: string, place: ReturnPlace) {
  try {
    sessionStorage.setItem(RETURN_PLACE_KEY, JSON.stringify({ path, place }))
    sessionStorage.removeItem(RETURN_OVERLAY_KEY)
  } catch {
    // Session storage can be unavailable in private browsing.
  }
}

export function peekReturnPlace(path: string): ReturnPlace | null {
  const stored = readStoredPlace()
  if (!stored || stored.path !== path) return null
  return stored.place
}

/** Read and clear the place recorded for the page the visitor just left. */
export function consumeReturnPlace(): ReturnPlace | null {
  const stored = readStoredPlace()
  clearReturnOverlay()
  if (stored) return stored.place
  return null
}

export function returnLinkProps(path: string, place: ReturnPlace) {
  return {
    to: path,
    state: { from: place },
    onClick: () => rememberReturnPlace(path, place),
  }
}

export function placeToHomeState(place: ReturnPlace): HomeLocationState {
  return place.kind === 'overlay'
    ? { overlay: place.overlay }
    : { scrollTo: place.section }
}

/** Back destination for a detail page: the path they arrived on, or a section. */
export function useDetailReturn(fallbackSection: string): HomeLocationState {
  const location = useLocation()
  const from = (location.state as { from?: unknown } | null)?.from
  const place = isReturnPlace(from) ? from : peekReturnPlace(location.pathname)
  if (place) return placeToHomeState(place)
  return { scrollTo: fallbackSection }
}

/** Close the project gallery, and drop the history entry that Back should undo. */
let galleryDismissing = false

export function dismissGallery() {
  if (galleryDismissing) return
  const { activeOverlay, closeOverlay } = useSpatialStore.getState()
  if (activeOverlay === 'laptop' && window.history.state?.spatialGallery) {
    galleryDismissing = true
    window.history.back()
    window.setTimeout(() => {
      galleryDismissing = false
    }, 400)
    return
  }
  closeOverlay()
}

export function clearReturnOverlay() {
  try {
    sessionStorage.removeItem(RETURN_OVERLAY_KEY)
    sessionStorage.removeItem(RETURN_PLACE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

/**
 * One spatial layer at a time, shared by the hero loop and the floating UI.
 * Animation loops should read this with getState() so a click does not
 * re-render the main scene.
 */
type SpatialState = {
  activeOverlay: OverlayType
  activeProjectId: string | null
  setActiveOverlay: (overlay: OverlayType) => void
  closeOverlay: () => void
  setActiveProject: (id: string | null) => void
  scrollToSection: (id: string) => void
  scrollToAbout: () => void
}

function rememberGalleryHistory() {
  if (typeof window === 'undefined') return
  if (window.history.state?.spatialGallery) return
  window.history.pushState({ ...(window.history.state ?? {}), spatialGallery: true }, '')
}

export const useSpatialStore = create<SpatialState>((set) => ({
  activeOverlay: null,
  activeProjectId: null,
  setActiveOverlay: (activeOverlay) => {
    set({ activeOverlay, activeProjectId: null })
    if (activeOverlay === 'laptop') rememberGalleryHistory()
  },
  closeOverlay: () => set({ activeOverlay: null, activeProjectId: null }),
  setActiveProject: (activeProjectId) => set({ activeProjectId }),
  scrollToSection: (id) => {
    set({ activeOverlay: null, activeProjectId: null })
    document.body.style.overflow = ''
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    })
  },
  scrollToAbout: () => {
    useSpatialStore.getState().scrollToSection('about')
  },
}))
