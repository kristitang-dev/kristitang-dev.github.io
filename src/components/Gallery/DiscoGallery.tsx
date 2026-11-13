import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl, Html } from '@react-three/drei'
import type { Group } from 'three'
import { galleryCards, type GalleryCard } from './galleryItems'
import { dismissGallery, useSpatialStore } from '../../store/spatialStore'
import { FlowField } from './FlowField'

function hashId(id: string) {
  let hash = 2166136261
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const screenSlot = new Map(
  [...galleryCards]
    .sort((a, b) => hashId(a.id) - hashId(b.id))
    .map((card, index) => [card.id, index]),
)

function screenPosition(id: string): [number, number, number] {
  const slot = screenSlot.get(id) ?? hashId(id) % 9
  const column = slot % 3
  const row = Math.floor(slot / 3)
  const hash = hashId(id)
  const jitterX = ((hash & 255) / 255 - 0.5) * 1.15
  const jitterY = (((hash >>> 8) & 255) / 255 - 0.5) * 0.9
  return [(column - 1) * 2.35 + jitterX, (1 - row) * 1.55 + jitterY, 0]
}

export function ProjectTile({ item }: { item: GalleryCard }) {
  const selected = useSpatialStore((state) => state.activeProjectId === item.id)
  const setActiveProject = useSpatialStore((state) => state.setActiveProject)
  const [playing, setPlaying] = useState(false)
  const showMotion = Boolean(item.motion && (playing || selected))

  const choose = (event: { stopPropagation: () => void }) => {
    event.stopPropagation()
    setActiveProject(selected ? null : item.id)
  }

  return (
    <div className={`disco-tile${item.quiet ? ' disco-tile--quiet' : ''}`}>
    <button
      type="button"
      className={`disco-card${item.quiet ? ' disco-card--quiet' : ''}${selected ? ' is-active' : ''}`}
      aria-pressed={selected}
      aria-label={item.title}
      data-project-id={item.id}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerEnter={() => item.motion && setPlaying(true)}
      onPointerLeave={() => setPlaying(false)}
      onFocus={() => item.motion && setPlaying(true)}
      onBlur={() => setPlaying(false)}
      onClick={choose}
    >
      {item.preview ? (
        <iframe
          className="disco-card__preview"
          src={item.preview}
          title=""
          tabIndex={-1}
          loading="lazy"
        />
      ) : (
        <>
          <img className={item.contain ? 'is-contain' : undefined} src={item.image} alt="" draggable={false} />
          {item.motion && showMotion && (
            <img className="disco-card__motion" src={item.motion} alt="" draggable={false} />
          )}
        </>
      )}
    </button>
    <div className="disco-tile__meta" onClick={choose}>
      <p className="disco-tile__title">{item.title}</p>
      {(item.previewTags ?? item.tags).length > 0 && (
        <ul className="disco-tile__tags">
          {(item.previewTags ?? item.tags).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </div>
    </div>
  )
}

function Thumbnail({
  item,
  position,
  reduceMotion,
}: {
  item: GalleryCard
  position: [number, number, number]
  reduceMotion: boolean
}) {
  const ref = useRef<Group>(null)
  const started = useRef<number | null>(null)
  const settled = useRef(reduceMotion)
  const drift = useRef({ x: 0, y: 0 })
  const phase = (hashId(item.id) % 1000) / 1000 * Math.PI * 2

  useLayoutEffect(() => {
    if (!settled.current || !ref.current) return
    ref.current.position.set(
      position[0] + drift.current.x,
      position[1] + drift.current.y,
      position[2],
    )
  }, [position])

  useFrame(({ clock }) => {
    const group = ref.current
    if (!group) return
    if (!settled.current) {
      if (started.current === null) started.current = clock.elapsedTime
      const t = Math.min(1, (clock.elapsedTime - started.current) / 1.15)
      const eased = 1 - (1 - t) ** 3
      group.position.set(
        position[0],
        position[1],
        position[2] - 2.6 * (1 - eased),
      )
      if (t >= 1) settled.current = true
      return
    }
    if (reduceMotion) return
    const time = clock.elapsedTime
    const selected = useSpatialStore.getState().activeProjectId === item.id
    const goalX = selected ? 0 : Math.sin(time * 0.42 + phase) * 0.08
    const goalY = selected ? 0 : Math.cos(time * 0.29 + phase * 1.4) * 0.055
    drift.current.x += (goalX - drift.current.x) * 0.045
    drift.current.y += (goalY - drift.current.y) * 0.045
    group.position.set(
      position[0] + drift.current.x,
      position[1] + drift.current.y,
      position[2],
    )
  })

  return (
    <group
      ref={ref}
      position={[position[0], position[1], reduceMotion ? position[2] : position[2] - 2.6]}
    >
      <Html
        center
        distanceFactor={6}
        zIndexRange={[24, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <ProjectTile item={item} />
      </Html>
    </group>
  )
}

function DiscoBall({ cards }: { cards: GalleryCard[] }) {
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useRef(
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const placements = cards.map((item) => ({
    item,
    position: screenPosition(item.id),
  }))

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <group>
      {mounted && placements.map(({ item, position }) => (
        <Thumbnail
          key={item.id}
          item={item}
          position={position}
          reduceMotion={reduceMotion.current}
        />
      ))}
    </group>
  )
}

const gesture = { pressed: false, moved: false, suppress: false }
let voidHandled = false

export function galleryDragged() {
  return gesture.moved || gesture.suppress
}

/** Empty space leaves a close-up for the full gallery, and leaves the full gallery for home. */
export function onGalleryVoid(still: boolean) {
  if (voidHandled) return
  voidHandled = true
  window.setTimeout(() => {
    voidHandled = false
  }, 0)
  const { activeProjectId, setActiveProject } = useSpatialStore.getState()
  if (!still && activeProjectId) {
    setActiveProject(null)
    return
  }
  dismissGallery()
}
const frameHome = { current: () => {} }

const { ACTION } = CameraControlsImpl

function GalleryCamera({ still }: { still: boolean }) {
  const controls = useRef<CameraControlsImpl>(null)
  const activeId = useSpatialStore((state) => state.activeProjectId)
  const width = useThree((state) => state.size.width)
  const narrow = width < 520

  const frame = (id: string | null) => {
    const rig = controls.current
    if (!rig) return false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ease = !reduce
    if (!id) {
      const distance = narrow ? 11.6 : 8.8
      rig.setLookAt(0, 0, distance, 0, 0, 0, ease)
    } else {
      const [x, y] = screenPosition(id)
      const distance = narrow ? 5.8 : 4.6
      const aimX = narrow ? x : x + 0.85
      const aimY = narrow ? y - 1.05 : y
      rig.setLookAt(aimX, aimY, distance, aimX, aimY, 0, ease)
    }
    return true
  }

  frameHome.current = () => {
    frame(null)
  }

  useLayoutEffect(() => {
    let frameId = 0
    const apply = () => {
      if (frame(still ? null : activeId)) return
      frameId = window.requestAnimationFrame(apply)
    }
    apply()
    return () => window.cancelAnimationFrame(frameId)
  }, [narrow, still, still ? null : activeId])

  return (
    <CameraControls
      ref={controls}
      smoothTime={0.7}
      draggingSmoothTime={0.04}
      dollySpeed={1}
      dollyToCursor
      minDistance={narrow ? 3.2 : 2.8}
      maxDistance={narrow ? 18 : 16}
      minAzimuthAngle={0}
      maxAzimuthAngle={0}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      mouseButtons={{
        left: ACTION.TRUCK,
        middle: ACTION.TRUCK,
        right: ACTION.TRUCK,
        wheel: ACTION.NONE,
      }}
      touches={{
        one: ACTION.TOUCH_TRUCK,
        two: ACTION.TOUCH_TRUCK,
        three: ACTION.TOUCH_TRUCK,
      }}
      onStart={() => {
        gesture.pressed = true
        gesture.moved = false
      }}
      onControl={() => {
        if (gesture.pressed) gesture.moved = true
      }}
      onEnd={() => {
        gesture.pressed = false
        if (gesture.moved) {
          gesture.suppress = true
          window.setTimeout(() => {
            gesture.suppress = false
          }, 160)
        }
        gesture.moved = false
      }}
    />
  )
}

export function DiscoGallery({
  cards,
  exiting = false,
  still = false,
}: {
  cards: GalleryCard[]
  exiting?: boolean
  still?: boolean
}) {
  return (
    <div className={`disco-gallery${still ? ' disco-gallery--behind' : ''}`}>
      <Canvas
        className="disco-gallery__canvas"
        camera={{ position: [0, 0, 8.8], fov: 36 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          if (exiting || gesture.moved || gesture.suppress) return
          onGalleryVoid(still)
        }}
      >
        <GalleryCamera still={still} />
        <FlowField exiting={exiting} calm={still} />
        <DiscoBall cards={cards} />
      </Canvas>
    </div>
  )
}
