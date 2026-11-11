import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { albums, notebooks } from '../../data/bookshelf'
import { galleryCardMatches, galleryCards, getGalleryCard } from '../Gallery/galleryItems'
import { researchItems, researchKindLabels } from '../../data/research'
import { workFilters, type WorkCategory } from '../../data/work'
import { rememberReturnOverlay, useSpatialStore } from '../../store/spatialStore'
import { DiscoGallery, ProjectCard } from '../Gallery/DiscoGallery'
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


function AbstractPanel() {
  const activeProjectId = useSpatialStore((state) => state.activeProjectId)
  const item = activeProjectId ? getGalleryCard(activeProjectId) : undefined
  if (!item) return null

  return (
    <aside className="spatial-glass spatial-abstract">
      <h2 className="spatial-abstract__title">{item.title}</h2>
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
  const [group, setGroup] = useState<WorkCategory>('all')
  const cards = galleryCards.filter((card) => {
    if (!galleryCardMatches(card, query)) return false
    if (!still || group === 'all') return true
    return card.categories?.includes(group) ?? false
  })

  useEffect(() => {
    const activeId = useSpatialStore.getState().activeProjectId
    if (activeId && !cards.some((card) => card.id === activeId)) {
      useSpatialStore.getState().setActiveProject(null)
    }
  }, [cards])

  return (
    <div className="spatial-laptop">
      <div className="spatial-gallery">
        <button
          type="button"
          className="spatial-layout"
          onClick={() => setStill((value) => !value)}
        >
          {still ? 'Orbit' : 'Grid'}
        </button>
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
        {still && (
          <div className="spatial-grid">
            <div className="spatial-grid__filters" role="tablist" aria-label="Filter projects">
              {workFilters.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={group === id}
                  className={`spatial-grid__filter${group === id ? ' is-active' : ''}`}
                  onClick={() => setGroup(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className="spatial-grid__list">
              {cards.map((item) => (
                <li key={item.id}>
                  <ProjectCard item={item} />
                  <p className="spatial-grid__title">{item.title}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cards.length === 0 && <p className="spatial-search__empty">No matching projects</p>}
      </div>
      <AbstractPanel />
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
  onOpen,
}: {
  frame: FilmFrame
  decorative?: boolean
  onOpen: (frame: FilmFrame) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [src, setSrc] = useState<string>()
  const [ratio, setRatio] = useState<number>()

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setSrc(frame.src)
        observer.disconnect()
      },
      { rootMargin: '320px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [frame.src])

  return (
    <button
      ref={ref}
      type="button"
      className="spatial-film__frame"
      style={ratio ? { width: `calc(var(--film-h) * ${ratio})` } : undefined}
      onClick={() => onOpen(frame)}
      aria-label={decorative ? undefined : frame.title}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
    >
      {src && (
        <img
          src={src}
          alt=""
          decoding="async"
          draggable={false}
          onLoad={(event) => {
            const image = event.currentTarget
            if (image.naturalHeight) setRatio(image.naturalWidth / image.naturalHeight)
          }}
        />
      )}
      <span className="spatial-film__meta">
        <span>{frame.title}</span>
        {frame.note && <small>{frame.note}</small>}
      </span>
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

  return (
    <>
      <div className={`spatial-film${active ? ' is-viewing' : ''}`} aria-label="Light table">
        {rows.map((row, index) => (
          <div className="spatial-marquee__row" key={index}>
            <div className={`spatial-marquee__track spatial-marquee__track--${index}`}>
              <div className="spatial-marquee__set">
                {row.map((frame) => (
                  <FilmStill key={frame.src} frame={frame} onOpen={setActive} />
                ))}
              </div>
              {!reducedMotion && (
                <div className="spatial-marquee__set" aria-hidden="true">
                  {row.map((frame) => (
                    <FilmStill key={`${frame.src}-copy`} frame={frame} decorative onOpen={setActive} />
                  ))}
                </div>
              )}
            </div>
          </div>
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
  const closeOverlay = useSpatialStore((state) => state.closeOverlay)
  const [tracked, setTracked] = useState(activeOverlay)
  const [galleryExit, setGalleryExit] = useState(false)

  if (activeOverlay !== tracked) {
    setTracked(activeOverlay)
    setGalleryExit(tracked === 'laptop' && activeOverlay === null)
  }

  useEffect(() => {
    if (!galleryExit) return
    const timer = window.setTimeout(() => setGalleryExit(false), 680)
    return () => window.clearTimeout(timer)
  }, [galleryExit])

  const overlayOpen = activeOverlay !== null || galleryExit

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
      state.closeOverlay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlayOpen, galleryExit])

  const visible = activeOverlay ?? (galleryExit ? 'laptop' : null)
  if (!visible) return null

  return createPortal(
    <div className={`spatial${visible === 'camera' ? ' spatial--darkroom' : ''}${galleryExit ? ' spatial--leaving' : ''}`}>
      <button type="button" className="spatial__scrim" aria-label="Close" onClick={closeOverlay} />
      <div
        className={`spatial__stage spatial__stage--${visible}`}
        role="dialog"
        aria-modal="true"
        aria-label={overlayLabel[visible]}
      >
        {visible === 'laptop' && <LaptopLayer exiting={galleryExit} />}
        {visible === 'bookshelf' && <ArchiveLayer />}
        {visible === 'camera' && <CameraLayer />}
      </div>
    </div>,
    document.body,
  )
}
