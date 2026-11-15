import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { albums, cameraShots, notebooks } from '../../data/bookshelf'
import { galleryCardMatches, galleryCards, gallerySorts, getGalleryCard } from '../Gallery/galleryItems'
import { researchItems, researchKindLabels } from '../../data/research'
import {
  dismissGallery,
  rememberReturnPlace,
  useSpatialStore,
  type ReturnPlace,
} from '../../store/spatialStore'
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
  for (const shot of cameraShots) {
    if (!shot.image || seen.has(shot.image)) continue
    seen.add(shot.image)
    frames.push({ src: shot.image, albumId: shot.id, title: shot.title, note: shot.note })
  }
  return frames
}

function filmRows(frames: FilmFrame[], count = 3) {
  const rows: FilmFrame[][] = Array.from({ length: count }, () => [])
  frames.forEach((frame, index) => rows[index % count].push(frame))
  return rows
}

const filmStills = stills()

const ratioCache = new Map<string, number>()
const ratioListeners = new Set<() => void>()
const ratioProbes = new Set<string>()
let ratioFlush = 0

function publishRatio(src: string, ratio: number) {
  if (!Number.isFinite(ratio) || ratio <= 0) return
  const known = ratioCache.get(src)
  if (known !== undefined && Math.abs(known - ratio) < 0.001) return
  ratioCache.set(src, ratio)
  window.cancelAnimationFrame(ratioFlush)
  ratioFlush = window.requestAnimationFrame(() => {
    ratioListeners.forEach((listener) => listener())
  })
}

function ratioFromBytes(bytes: Uint8Array) {
  if (bytes.length < 24) return null
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    const width = bytes[6] | (bytes[7] << 8)
    const height = bytes[8] | (bytes[9] << 8)
    return height ? width / height : null
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19]
    const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]
    return height ? width / height : null
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let i = 2
  while (i + 8 < bytes.length) {
    if (bytes[i] !== 0xff) return null
    while (bytes[i] === 0xff) i += 1
    const marker = bytes[i]
    i += 1
    if (marker === 0xd8 || marker === 0xd9) continue
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (i + 1 >= bytes.length) return null
    const size = (bytes[i] << 8) | bytes[i + 1]
    if (size < 2) return null
    const sized = (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb)
      || (marker >= 0xcd && marker <= 0xcf)
    if (sized) {
      if (i + 6 >= bytes.length) return null
      const height = (bytes[i + 3] << 8) | bytes[i + 4]
      const width = (bytes[i + 5] << 8) | bytes[i + 6]
      return height ? width / height : null
    }
    i += size
  }
  return null
}

function preloadStill(src: string) {
  if (ratioCache.has(src) || ratioProbes.has(src)) return
  ratioProbes.add(src)
  fetch(src, { headers: { Range: 'bytes=0-65535' } })
    .then(async (response) => {
      const reader = response.body?.getReader()
      if (!reader) return
      const chunks: Uint8Array[] = []
      let got = 0
      while (got < 65536) {
        const { done, value } = await reader.read()
        if (done || !value) break
        chunks.push(value)
        got += value.length
      }
      reader.cancel().catch(() => {})
      const bytes = new Uint8Array(got)
      let offset = 0
      for (const chunk of chunks) {
        bytes.set(chunk, offset)
        offset += chunk.length
      }
      const ratio = ratioFromBytes(bytes)
      if (ratio) publishRatio(src, ratio)
    })
    .catch(() => {})
}

function useFilmRatios() {
  const [ratios, setRatios] = useState<Record<string, number>>(() => Object.fromEntries(ratioCache))
  useEffect(() => {
    const sync = () => setRatios(Object.fromEntries(ratioCache))
    ratioListeners.add(sync)
    sync()
    return () => {
      ratioListeners.delete(sync)
    }
  }, [])
  return ratios
}

const rowMotion = [
  { seconds: 96, direction: 1, start: 0 },
  { seconds: 114, direction: -1, start: 0.42 },
  { seconds: 84, direction: 1, start: 26 / 84 },
] as const

type FilmRowHandle = {
  offset: () => number
  setOffset: (value: number) => void
}

function overlayReturn(path: string) {
  const overlay = useSpatialStore.getState().activeOverlay
  const place: ReturnPlace | null = overlay ? { kind: 'overlay', overlay } : null
  return {
    state: place ? { from: place } : undefined,
    onClick: () => {
      if (place) rememberReturnPlace(path, place)
      useSpatialStore.getState().closeOverlay()
    },
  }
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
      <Link className="spatial-abstract__cta" to={item.to} {...overlayReturn(item.to)}>
        View project
      </Link>
    </aside>
  )
}

function tidyGalleryByDefault() {
  return window.matchMedia('(max-width: 760px)').matches
}

function LaptopLayer({ exiting = false }: { exiting?: boolean }) {
  const [query, setQuery] = useState('')
  const [still, setStill] = useState(tidyGalleryByDefault)
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
                <Link to={`/garden/${entry.id}`} {...overlayReturn(`/garden/${entry.id}`)}>
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
              <Link to={`/research/${item.id}`} {...overlayReturn(`/research/${item.id}`)}>
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
  onOpen,
}: {
  frame: FilmFrame
  decorative?: boolean
  ratio?: number
  onOpen: (frame: FilmFrame) => void
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [shown, setShown] = useState(false)
  const reveal = (image: HTMLImageElement) => {
    if (image.naturalHeight) publishRatio(frame.src, image.naturalWidth / image.naturalHeight)
    setShown(true)
  }

  useLayoutEffect(() => {
    const image = imgRef.current
    if (image?.complete && image.naturalWidth) reveal(image)
  }, [frame.src])

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
        ref={imgRef}
        src={frame.src}
        alt=""
        decoding="async"
        draggable={false}
        className={shown ? 'is-shown' : undefined}
        onLoad={(event) => reveal(event.currentTarget)}
        onError={() => publishRatio(frame.src, 1)}
      />
      <span className="spatial-film__meta">
        <span>{frame.title}</span>
        {frame.note && <small>{frame.note}</small>}
      </span>
    </button>
  )
}

const MarqueeRow = forwardRef<FilmRowHandle, {
  frames: FilmFrame[]
  index: number
  reduced: boolean
  ratios: Record<string, number>
  paused: boolean
  dragging: boolean
  onOpen: (frame: FilmFrame) => void
}>(function MarqueeRow({ frames, index, reduced, ratios, paused, dragging, onOpen }, ref) {
  const motion = rowMotion[index] ?? rowMotion[0]
  const rowRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const loopRef = useRef(0)
  const pausedRef = useRef(false)
  const [copies, setCopies] = useState(2)
  const [held, setHeld] = useState(false)
  const ready = frames.every((frame) => ratios[frame.src])
  pausedRef.current = reduced || paused || held || dragging

  const paint = () => {
    const loop = loopRef.current
    const track = trackRef.current
    if (!track || loop <= 0) return
    const wrapped = ((offsetRef.current % loop) + loop) % loop
    track.style.transform = `translate3d(${-wrapped}px, 0, 0)`
  }

  useImperativeHandle(ref, () => ({
    offset: () => offsetRef.current,
    setOffset: (value: number) => {
      offsetRef.current = value
      paint()
    },
  }))

  useLayoutEffect(() => {
    const setNode = setRef.current
    const rowNode = rowRef.current
    if (!setNode || !rowNode) return
    const measure = () => {
      const width = setNode.getBoundingClientRect().width
      const view = rowNode.clientWidth
      if (width > 1) {
        const previous = loopRef.current
        if (!(previous > 1 && Math.abs(previous - width) < 0.5)) {
          offsetRef.current = previous > 1 ? offsetRef.current * (width / previous) : width * motion.start
          loopRef.current = width
        }
        const needed = Math.max(2, Math.ceil(view / width) + 1)
        setCopies((current) => (current === needed ? current : needed))
      }
      paint()
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(setNode)
    observer.observe(rowNode)
    return () => observer.disconnect()
  }, [frames, ratios, copies, motion.start])

  useEffect(() => {
    if (reduced) return
    let last = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const loop = loopRef.current
      if (loop > 0 && !pausedRef.current) offsetRef.current += (loop / motion.seconds) * motion.direction * dt
      paint()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduced, motion.seconds, motion.direction])

  return (
    <div
      ref={rowRef}
      className={`spatial-marquee__row${ready ? ' is-ready' : ''}${dragging ? ' is-dragging' : ''}`}
      data-row={index}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false)
      }}
    >
      <div ref={trackRef} className={`spatial-marquee__track spatial-marquee__track--${index}`}>
        {Array.from({ length: copies }, (_, copy) => (
          <div
            key={copy}
            className="spatial-marquee__set"
            ref={copy === 0 ? setRef : undefined}
            aria-hidden={copy > 0 || undefined}
          >
            {frames.map((frame) => (
              <FilmStill
                key={`${frame.src}-${copy}`}
                frame={frame}
                decorative={copy > 0}
                ratio={ratios[frame.src]}
                onOpen={onOpen}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

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
  const ratios = useFilmRatios()
  const [active, setActive] = useState<FilmFrame | null>(null)
  const [dragRow, setDragRow] = useState<number | null>(null)
  useEffect(() => {
    filmStills.forEach((frame) => preloadStill(frame.src))
  }, [])
  const filmRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Array<FilmRowHandle | null>>([])
  const shiftRows = (indexes: number[], delta: number, origins: number[]) => {
    indexes.forEach((index, place) => {
      rowRefs.current[index]?.setOffset(origins[place] + delta)
    })
  }

  useEffect(() => {
    const node = filmRef.current
    if (!node) return
    const onWheel = (event: WheelEvent) => {
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientWidth : 1
      const rawX = event.deltaX * scale
      const rawY = event.deltaY * scale
      const delta = Math.abs(rawX) > Math.abs(rawY) ? rawX : rawY
      if (!delta) return
      const row = (event.target as Element | null)?.closest?.('.spatial-marquee__row')
      const index = row ? Number((row as HTMLElement).dataset.row) : -1
      const indexes = index >= 0 ? [index] : rowRefs.current.map((_, place) => place)
      event.preventDefault()
      shiftRows(
        indexes,
        delta,
        indexes.map((place) => rowRefs.current[place]?.offset() ?? 0),
      )
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <>
      <div
        ref={filmRef}
        className={`spatial-film${active ? ' is-viewing' : ''}${dragRow !== null ? ' is-dragging' : ''}`}
        aria-label="Light table"
        onPointerDown={(event) => {
          if (event.button !== 0) return
          const row = (event.target as Element).closest('.spatial-marquee__row')
          const index = row ? Number((row as HTMLElement).dataset.row) : -1
          const indexes = index >= 0 ? [index] : rowRefs.current.map((_, place) => place)
          const origins = indexes.map((place) => rowRefs.current[place]?.offset() ?? 0)
          const startX = event.clientX
          let moved = false
          const onMove = (ev: PointerEvent) => {
            const dx = ev.clientX - startX
            if (!moved && Math.abs(dx) <= 6) return
            if (!moved) {
              moved = true
              setDragRow(index)
            }
            shiftRows(indexes, -dx, origins)
          }
          const onUp = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onUp)
            setDragRow(null)
            if (!moved) return
            const stopClick = (click: Event) => {
              click.preventDefault()
              click.stopPropagation()
              window.removeEventListener('click', stopClick, true)
            }
            window.addEventListener('click', stopClick, true)
          }
          window.addEventListener('pointermove', onMove)
          window.addEventListener('pointerup', onUp)
          window.addEventListener('pointercancel', onUp)
        }}
      >
        {rows.map((row, index) => (
          <MarqueeRow
            key={index}
            ref={(node) => {
              rowRefs.current[index] = node
            }}
            frames={row}
            index={index}
            reduced={reducedMotion}
            ratios={ratios}
            paused={active !== null}
            dragging={dragRow === index || dragRow === -1}
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
