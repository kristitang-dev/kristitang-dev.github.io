import { create } from 'zustand'

export type OverlayType = 'laptop' | 'bookshelf' | 'camera' | null

export type HomeLocationState = {
  scrollTo?: string
  overlay?: Exclude<OverlayType, null>
}

const RETURN_OVERLAY_KEY = 'spatial-return-overlay'

function isOverlay(value: string | null): value is Exclude<OverlayType, null> {
  return value === 'laptop' || value === 'bookshelf' || value === 'camera'
}

/** Remember which window a detail page should restore on browser back. */
export function rememberReturnOverlay(overlay: Exclude<OverlayType, null>) {
  try {
    sessionStorage.setItem(RETURN_OVERLAY_KEY, overlay)
  } catch {
    // Session storage can be unavailable in private browsing.
  }
}

export function consumeReturnOverlay(): Exclude<OverlayType, null> | null {
  try {
    const value = sessionStorage.getItem(RETURN_OVERLAY_KEY)
    sessionStorage.removeItem(RETURN_OVERLAY_KEY)
    return isOverlay(value) ? value : null
  } catch {
    return null
  }
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
