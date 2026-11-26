import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import './ReadingRail.css'

/** at: where the section starts in reading progress (0–1); pos: where its tick is drawn. */
type Tick = { id: number; label: string; at: number; pos: number; el: HTMLElement }

const MIN_TICK_GAP = 10 // px between ticks, so close headings stay distinct

/** Nudge crowded ticks apart, keeping their order and staying inside the rail. */
function spreadTicks(ats: number[], height: number) {
  if (height <= 0 || ats.length === 0) return ats
  const gap = Math.min(MIN_TICK_GAP, height / Math.max(ats.length - 1, 1))
  const px = ats.map((at) => at * height)
  for (let i = 1; i < px.length; i += 1) px[i] = Math.max(px[i], px[i - 1] + gap)
  px[px.length - 1] = Math.min(px[px.length - 1], height)
  for (let i = px.length - 2; i >= 0; i -= 1) px[i] = Math.min(px[i], px[i + 1] - gap)
  return px.map((value) => Math.max(0, value) / height)
}

type ReadingRailProps = {
  /** The article being read. Progress runs from its top to its bottom. */
  targetRef: RefObject<HTMLElement | null>
  /** Section headings inside the article that get a tick. */
  headingSelector: string
  /** Where the page's own "← Back" link goes; shown once that link scrolls away. */
  back?: { to: string; label: string; state?: unknown }
  /** Dark sections the rail may sit over (switches it to light ink there). */
  darkSelector?: string
}

const NAV_OFFSET = 72 // nav height plus breathing room, in px

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Section ticks in the right margin (desktop) and a back button that follows
 * the reader (left margin on desktop, bottom-left pill on phones).
 */
export function ReadingRail({ targetRef, headingSelector, back, darkSelector }: ReadingRailProps) {
  const [ticks, setTicks] = useState<Tick[]>([])
  const [active, setActive] = useState(-1)
  const [showBack, setShowBack] = useState(false)
  const [scrollable, setScrollable] = useState(false)
  const [railDark, setRailDark] = useState(false)
  const [backDark, setBackDark] = useState(false)
  const [atFooter, setAtFooter] = useState(false)
  const railRef = useRef<HTMLElement>(null)
  const backRef = useRef<HTMLAnchorElement>(null)
  const frame = useRef(0)

  // Scroll range for the article: 0 when its top meets the nav, 1 when its end
  // reaches the bottom of the screen.
  const range = useCallback(() => {
    const article = targetRef.current
    if (!article) return null
    const box = article.getBoundingClientRect()
    const top = box.top + window.scrollY
    const start = top - NAV_OFFSET
    const end = top + box.height - window.innerHeight
    return { start, end: Math.max(end, start + 1) }
  }, [targetRef])

  const measure = useCallback(() => {
    const article = targetRef.current
    const span = range()
    if (!article || !span) return
    setScrollable(span.end - span.start > window.innerHeight * 0.5)
    const found = Array.from(article.querySelectorAll<HTMLElement>(headingSelector))
      .map((el, id) => ({ el, id, label: (el.textContent ?? '').trim() }))
      .filter((tick) => tick.label.length > 0)
      .map((tick) => {
        // The point where this heading reaches the top is where its tick sits.
        const y = tick.el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
        const at = Math.min(1, Math.max(0, (y - span.start) / (span.end - span.start)))
        return { ...tick, at }
      })
    const railHeight = railRef.current?.querySelector('.reading-rail__track')?.clientHeight ?? 0
    const spread = spreadTicks(
      found.map((tick) => tick.at),
      railHeight,
    )
    setTicks(found.map((tick, index) => ({ ...tick, pos: spread[index] })))
  }, [targetRef, headingSelector, range])

  const update = useCallback(() => {
    const span = range()
    if (!span) return
    const y = window.scrollY

    // Current section: the last heading that has passed the upper third.
    const line = NAV_OFFSET + window.innerHeight * 0.3
    let current = -1
    ticks.forEach((tick, index) => {
      if (tick.el.getBoundingClientRect().top <= line) current = index
    })
    setActive(current)

    // The follow-along back button appears once the page's own back link is gone.
    setShowBack(y > span.start + 220)

    // Step aside when the footer scrolls up to the rail.
    const footer = document.querySelector('.footer')
    const rail = railRef.current
    if (footer && rail) {
      setAtFooter(footer.getBoundingClientRect().top < rail.getBoundingClientRect().bottom + 24)
    }

    if (darkSelector) {
      const darks = Array.from(document.querySelectorAll(darkSelector)).map((el) =>
        el.getBoundingClientRect(),
      )
      const over = (el: HTMLElement | null) => {
        if (!el) return false
        const box = el.getBoundingClientRect()
        const mid = box.top + box.height / 2
        return darks.some((d) => mid >= d.top && mid <= d.bottom)
      }
      setRailDark(over(railRef.current))
      setBackDark(over(backRef.current))
    }
  }, [range, ticks, darkSelector])

  // Re-measure when the article changes size (images loading, fonts, resize).
  useEffect(() => {
    const article = targetRef.current
    if (!article) return
    measure()
    const observer = new ResizeObserver(() => measure())
    observer.observe(article)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [targetRef, measure])

  // The rail only mounts once the page is long enough; measure tick spacing then.
  useEffect(() => {
    if (scrollable) measure()
  }, [scrollable, measure])

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [update])

  const jumpTo = (tick: Tick) => {
    const y = tick.el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  if (!scrollable) return null

  return (
    <>
      {back && (
        <Link
          ref={backRef}
          to={back.to}
          state={back.state}
          className={`reading-back${showBack ? ' is-shown' : ''}${backDark ? ' is-dark' : ''}`}
          aria-hidden={!showBack}
          tabIndex={showBack ? 0 : -1}
        >
          <span className="reading-back__arrow" aria-hidden="true">
            ←
          </span>
          <span className="reading-back__label">{back.label}</span>
        </Link>
      )}

      <nav
        ref={railRef}
        className={`reading-rail${railDark ? ' is-dark' : ''}${atFooter ? ' is-away' : ''}`}
        aria-label="Sections"
      >
        <div className="reading-rail__track">
          {ticks.map((tick, index) => (
            <button
              key={tick.id}
              type="button"
              className={`reading-rail__tick${index === active ? ' is-active' : ''}`}
              style={{ top: `${tick.pos * 100}%` }}
              onClick={() => jumpTo(tick)}
              aria-current={index === active ? 'location' : undefined}
            >
              <span className="reading-rail__label">{tick.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
