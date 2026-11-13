import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { albums, notebooks } from '../../data/bookshelf'
import { galleryCardMatches, galleryCards, gallerySorts, getGalleryCard } from '../Gallery/galleryItems'
import { researchItems, researchKindLabels } from '../../data/research'
import { dismissGallery, rememberReturnOverlay, useSpatialStore } from '../../store/spatialStore'
import { DiscoGallery, galleryDragged, onGalleryVoid, ProjectTile } from '../Gallery/DiscoGallery'
import './SpatialLayer.css'

type FilmFrame = {
  src: string
  albumId: string
  title: string
  note?: string
}

const filmNotes: Record<string, string> = {
  breath: 'Rural China',
  'chongqing-2023ss': 'Chongqing',
}

function stills() {
  const frames: FilmFrame[] = []
  const seen = new Set<string>()
  for (const album of albums) {
    const sources = [album.image]
    for (const block of album.galleryBlocks ?? []) {
      for (const image of block.images) {
        sources.push(typeof image === 'string' ? image : image.src)
      }
    }
    for (const src of sources) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      frames.push({ src, albumId: album.id, title: album.title, note: filmNotes[album.id] })
    }
  }
  return frames
}

function filmRows(frames: FilmFrame[], count = 3) {
  const rows: FilmFrame[][] = Array.from({ length: count }, () => [])
  frames.forEach((frame, index) => rows[index % count].push(frame))
  return rows
}

const filmStills = stills()

function leaveForDetail() {
  const overlay = useSpatialStore.getState().activeOverlay
  if (overlay) rememberReturnOverlay(overlay)
  useSpatialStore.getState().closeOverlay()
}


function AbstractPanel({ tidy }: { tidy: boolean }) {
  const activeProjectId = useSpatialStore((state) => state.activeProjectId)
  const item = activeProjectId ? getGalleryCard(activeProjectId) : undefined
  const panel = useRef<HTMLElement>(null)
  const skipIntro = useRef(true)
  const [spot, setSpot] = useState({ left: 0, top: 0, width: 280 })

  useEffect(() => {
    if (!item || tidy) return
    let frame = 0
    const place = () => {
      frame = requestAnimationFrame(place)
      const host = panel.current?.closest('.spatial-laptop')
      if (!host || !panel.current) return
      const anchor = document.querySelector(`[data-project-id="${CSS.escape(item.id)}"]`)
      if (!anchor) return
      const bounds = host.getBoundingClientRect()
      const margin = 44
      const width = Math.min(280, bounds.width - margin * 2)
      const height = panel.current.offsetHeight
      const card = anchor.getBoundingClientRect()
      let left = card.right - bounds.left + margin
      let top = card.top - bounds.top + card.height * 0.12
      if (left + width > bounds.width - margin) left = card.left - bounds.left - width - margin
      if (left < margin) {
        left = Math.min(Math.max(margin, card.left - bounds.left), bounds.width - width - margin)
        top = card.bottom - bounds.top + margin
        if (top + height > bounds.height - margin) top = card.top - bounds.top - height - margin
      }
      top = Math.min(Math.max(margin, top), Math.max(margin, bounds.height - height - margin))
      left = Math.min(Math.max(margin, left), Math.max(margin, bounds.width - width - margin))
      setSpot((current) => (
        Math.abs(current.left - left) < 0.5
        && Math.abs(current.top - top) < 0.5
        && current.width === width
          ? current
          : { left, top, width }
      ))
    }
    place()
    return () => cancelAnimationFrame(frame)
  }, [item, tidy])

  useEffect(() => {
    const node = panel.current
    if (!node) return
    if (skipIntro.current) {
      skipIntro.current = false
      return
    }
    node.style.animation = 'none'
    void node.offsetWidth
    node.style.animation = ''
  }, [item?.id, tidy])

  if (!item) return null

  return (
    <aside
      ref={panel}
      className="spatial-glass spatial-abstract"
      style={tidy ? undefined : { left: spot.left, top: spot.top, width: spot.width }}
    >
      {tidy && <h2 className="spatial-abstract__title">{item.title}</h2>}
      <p className="spatial-abstract__body">{item.description}</p>
      {item.tags.length > 0 && (
        <ul className="spatial-abstract__tags">
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <Link className="spatial-abstract__cta" to={item.to} onClick={leaveForDetail}>
        View project
      </Link>
    </aside>
  )
}

function LaptopLayer({ exiting = false }: { exiting?: boolean }) {
  const [query, setQuery] = useState('')
  const [still, setStill] = useState(false)
  const [gridMounted, setGridMounted] = useState(false)
  const [gridOn, setGridOn] = useState(false)
  const [group, setGroup] = useState('all')
  const [sortOpen, setSortOpen] = useState(false)
  const sortMenu = useRef<HTMLDivElement>(null)
  const cards = galleryCards.filter((card) => {
    if (!galleryCardMatches(card, query)) return false
    if (!still || group === 'all') return true
    return card.sorts?.includes(group) ?? false
  })

  const cardIds = cards.map((card) => card.id).join('\n')

  useEffect(() => {
    const ids = cardIds ? cardIds.split('\n') : []
    const activeId = useSpatialStore.getState().activeProjectId
    if (activeId && ids.includes(activeId)) return
    if (still && ids[0]) {
      useSpatialStore.getState().setActiveProject(ids[0])
      return
    }
    if (activeId) useSpatialStore.getState().setActiveProject(null)
  }, [still, cardIds])

  useEffect(() => {
    if (still) {
      setGridMounted(true)
      setGridOn(true)
      return
    }
    setGridOn(false)
    setSortOpen(false)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setGridMounted(false), reduce ? 0 : 620)
    return () => window.clearTimeout(timer)
  }, [still])

  useEffect(() => {
    if (!sortOpen) return
    const close = (event: PointerEvent) => {
      if (!sortMenu.current?.contains(event.target as Node)) setSortOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      setSortOpen(false)
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [sortOpen])

  return (
    <div className={`spatial-laptop${still ? ' is-tidy' : ''}`}>
      <div
        className="spatial-gallery"
        onClick={(event) => {
          if (exiting) return
          const target = event.target as HTMLElement
          if (target.closest('.disco-tile, .spatial-tools, .spatial-search, .spatial-abstract, a, button')) return
          if (galleryDragged()) return
          onGalleryVoid(still)
        }}
      >
        <div className="spatial-tools">
          <button
            type="button"
            className={`spatial-layout${still ? ' is-active' : ''}`}
            aria-pressed={still}
            onClick={() => setStill((value) => !value)}
          >
            Clean Up
          </button>
          {gridMounted && (
            <div className="spatial-sort" ref={sortMenu}>
              <button
                type="button"
                className={`spatial-sort__button${sortOpen ? ' is-open' : ''}${group !== 'all' ? ' is-active' : ''}`}
                aria-expanded={sortOpen}
                aria-haspopup="menu"
                onClick={() => setSortOpen((open) => !open)}
              >
                Sort Up
              </button>
              {sortOpen && (
                <ul className="spatial-sort__menu" role="menu" aria-label="Sort by">
                  <li className="spatial-sort__label" role="presentation">Sort by</li>
                  {gallerySorts.map(({ id, label }) => (
                    <li key={id} role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={group === id}
                        className={group === id ? ' is-active' : ''}
                        onClick={() => {
                          setGroup(id)
                          setSortOpen(false)
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <form className="spatial-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <input
            type="search"
            value={query}
            placeholder="Search projects"
            aria-label="Search projects"
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
        <DiscoGallery cards={cards} exiting={exiting} still={still} />
        {gridMounted && (
          <div
            className={`spatial-grid${gridOn ? ' is-shown' : ''}`}
            onClick={(event) => {
              const target = event.target as HTMLElement
              if (target.closest('.disco-tile, .spatial-sort, a, button')) return
              onGalleryVoid(true)
            }}
          >
            <ul className="spatial-grid__list">
              {cards.map((item) => (
                <li key={item.id}>
                  <ProjectTile item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {cards.length === 0 && <p className="spatial-search__empty">No matching projects</p>}
        <AbstractPanel tidy={still} />
      </div>
    </div>
  )
}

function ArchiveLayer() {
  const closeOverlay = useSpatialStore((state) => state.closeOverlay)

  return (
    <div className="spatial-glass spatial-archive" aria-label="Academic archive">
      <section className="spatial-archive__group">
        <h2 className="spatial-archive__label">Notebooks</h2>
        <ul className="spatial-archive__list">
          {notebooks.map((entry) => (
            <li key={entry.id}>
              {entry.redirect && entry.link ? (
                <a href={entry.link} target="_blank" rel="noopener noreferrer" onClick={() => closeOverlay()}>
                  <span>{entry.courseLabel ?? entry.title}</span>
                  <small>{entry.description}</small>
                </a>
              ) : (
                <Link to={`/garden/${entry.id}`} onClick={leaveForDetail}>
                  <span>{entry.courseLabel ?? entry.title}</span>
                  <small>{entry.description}</small>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="spatial-archive__group">
        <h2 className="spatial-archive__label">Research</h2>
        <ul className="spatial-archive__list">
          {researchItems.map((item) => (
            <li key={item.id}>
              <Link to={`/research/${item.id}`} onClick={leaveForDetail}>
                <span className="spatial-archive__text">
                  <span>{item.title}</span>
                  <small>
                    {researchKindLabels[item.kind]}
                    {item.period ? ` · ${item.period}` : ''}
                  </small>
                </span>
                {item.image && (
                  <img className="spatial-archive__thumb" src={item.image} alt="" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function FilmStill({
  frame,
  decorative = false,
  ratio,
  onRatio,
  onOpen,
}: {
  frame: FilmFrame
  decorative?: boolean
  ratio?: number
  onRatio: (src: string, ratio: number) => void
  onOpen: (frame: FilmFrame) => void
}) {
  return (
    <button
      type="button"
      className="spatial-film__frame"
      style={ratio ? { width: `calc(var(--film-h) * ${ratio})` } : undefined}
      onClick={() => onOpen(frame)}
      aria-label={decorative ? undefined : frame.title}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
    >
      <img
        src={frame.src}
        alt=""
        decoding="async"
        draggable={false}
        onLoad={(event) => {
          const image = event.currentTarget
          if (image.naturalHeight) onRatio(frame.src, image.naturalWidth / image.naturalHeight)
        }}
      />
      <span className="spatial-film__meta">
        <span>{frame.title}</span>
        {frame.note && <small>{frame.note}</small>}
      </span>
    </button>
  )
}

function MarqueeRow({
  frames,
  index,
  reduced,
  ratios,
  onRatio,
  onOpen,
}: {
  frames: FilmFrame[]
  index: number
  reduced: boolean
  ratios: Record<string, number>
  onRatio: (src: string, ratio: number) => void
  onOpen: (frame: FilmFrame) => void
}) {
  const setRef = useRef<HTMLDivElement>(null)
  const [shift, setShift] = useState(0)
  const [ready, setReady] = useState(reduced)

  useLayoutEffect(() => {
    const node = setRef.current
    if (!node || reduced) return
    let settle = 0
    let last = 0
    const measure = () => {
      const width = node.getBoundingClientRect().width
      if (Math.abs(last - width) < 0.5) return
      last = width
      setShift(width)
      setReady(false)
      window.clearTimeout(settle)
      settle = window.setTimeout(() => setReady(true), 180)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => {
      observer.disconnect()
      window.clearTimeout(settle)
    }
  }, [frames, ratios, reduced])

  return (
    <div className="spatial-marquee__row">
      <div
        className={`spatial-marquee__track spatial-marquee__track--${index}${ready && shift ? ' is-ready' : ''}`}
        style={shift ? ({ '--marquee-shift': `${shift}px` } as React.CSSProperties) : undefined}
      >
        <div className="spatial-marquee__set" ref={setRef}>
          {frames.map((frame) => (
            <FilmStill
              key={frame.src}
              frame={frame}
              ratio={ratios[frame.src]}
              onRatio={onRatio}
              onOpen={onOpen}
            />
          ))}
        </div>
        {!reduced && (
          <div className="spatial-marquee__set" aria-hidden="true">
            {frames.map((frame) => (
              <FilmStill
                key={`${frame.src}-copy`}
                frame={frame}
                decorative
                ratio={ratios[frame.src]}
                onRatio={onRatio}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="spatial__close" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8" />
      </svg>
    </button>
  )
}

function PhotoWindow({ frame, onClose }: { frame: FilmFrame; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return (
    <div className="spatial-lightbox" role="dialog" aria-modal="true" aria-label={frame.title}>
      <button type="button" className="spatial-lightbox__backdrop" aria-label="Close photograph" onClick={onClose} />
      <CloseButton label="Close photograph" onClick={onClose} />
      <figure className="spatial-lightbox__figure">
        <img src={frame.src} alt={frame.title} />
        <figcaption>
          <span>{frame.title}</span>
          {frame.note && <small>{frame.note}</small>}
        </figcaption>
      </figure>
    </div>
  )
}

function CameraLayer() {
  const reducedMotion = useReducedMotion()
  const rows = filmRows(filmStills)
  const [active, setActive] = useState<FilmFrame | null>(null)
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const rememberRatio = (src: string, ratio: number) => {
    setRatios((current) => (current[src] === ratio ? current : { ...current, [src]: ratio }))
  }

  return (
    <>
      <div className={`spatial-film${active ? ' is-viewing' : ''}`} aria-label="Light table">
        {rows.map((row, index) => (
          <MarqueeRow
            key={index}
            frames={row}
            index={index}
            reduced={reducedMotion}
            ratios={ratios}
            onRatio={rememberRatio}
            onOpen={setActive}
          />
        ))}
      </div>
      {active && <PhotoWindow frame={active} onClose={() => setActive(null)} />}
    </>
  )
}

const overlayLabel = {
  laptop: 'Projects',
  bookshelf: 'Academic archive',
  camera: 'Light table',
} as const

export function SpatialLayer() {
  const activeOverlay = useSpatialStore((state) => state.activeOverlay)
  const [tracked, setTracked] = useState(activeOverlay)
  const [galleryExit, setGalleryExit] = useState(false)

  if (activeOverlay !== tracked) {
    setTracked(activeOverlay)
    setGalleryExit(tracked === 'laptop' && activeOverlay === null)
  }

  useEffect(() => {
    if (!galleryExit) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setGalleryExit(false), reduce ? 0 : 400)
    return () => window.clearTimeout(timer)
  }, [galleryExit])

  const overlayOpen = activeOverlay !== null || galleryExit

  useEffect(() => {
    const onPop = () => {
      const marked = Boolean(window.history.state?.spatialGallery)
      const open = useSpatialStore.getState().activeOverlay === 'laptop'
      if (open && !marked) useSpatialStore.getState().closeOverlay()
      else if (!open && marked) useSpatialStore.getState().setActiveOverlay('laptop')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!overlayOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [overlayOpen])

  useEffect(() => {
    if (!overlayOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || galleryExit) return
      const state = useSpatialStore.getState()
      if (state.activeOverlay === 'laptop' && state.activeProjectId) {
        state.setActiveProject(null)
        return
      }
      dismissGallery()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlayOpen, galleryExit])

  const visible = activeOverlay ?? (galleryExit ? 'laptop' : null)
  if (!visible) return null

  return createPortal(
    <div className={`spatial${visible === 'camera' ? ' spatial--darkroom' : ''}${galleryExit ? ' spatial--leaving' : ''}`}>
      <button type="button" className="spatial__scrim" aria-label="Close" onClick={dismissGallery} />
      <div
        className={`spatial__stage spatial__stage--${visible}`}
        role="dialog"
        aria-modal="true"
        aria-label={overlayLabel[visible]}
      >
        <CloseButton label="Close" onClick={dismissGallery} />
        {visible === 'laptop' && <LaptopLayer exiting={galleryExit} />}
        {visible === 'bookshelf' && <ArchiveLayer />}
        {visible === 'camera' && <CameraLayer />}
      </div>
    </div>,
    document.body,
  )
}
