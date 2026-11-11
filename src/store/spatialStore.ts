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
  scrollToAbout: () => void
}

export const useSpatialStore = create<SpatialState>((set) => ({
  activeOverlay: null,
  activeProjectId: null,
  setActiveOverlay: (activeOverlay) => set({ activeOverlay, activeProjectId: null }),
  closeOverlay: () => set({ activeOverlay: null, activeProjectId: null }),
  setActiveProject: (activeProjectId) => set({ activeProjectId }),
  scrollToAbout: () => {
    set({ activeOverlay: null, activeProjectId: null })
    document.body.style.overflow = ''
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('about')?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
    })
  },
}))
