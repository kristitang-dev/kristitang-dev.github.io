import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import { type GalleryCard } from './galleryItems'
import { useSpatialStore } from '../../store/spatialStore'
import { fibonacciSphere } from './fibonacci'
import { FlowField } from './FlowField'

const SPHERE_RADIUS = 2.15

export function ProjectCard({ item }: { item: GalleryCard }) {
  const selected = useSpatialStore((state) => state.activeProjectId === item.id)
  const setActiveProject = useSpatialStore((state) => state.setActiveProject)

  return (
    <button
      type="button"
      className={`disco-card${item.quiet ? ' disco-card--quiet' : ''}${selected ? ' is-active' : ''}`}
      aria-pressed={selected}
      aria-label={item.title}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        setActiveProject(selected ? null : item.id)
      }}
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
        <img src={item.image} alt="" draggable={false} />
      )}
    </button>
  )
}

function Thumbnail({
  item,
  position,
}: {
  item: GalleryCard
  position: [number, number, number]
}) {
  const ref = useRef<Group>(null)
  const phase = useRef(item.id.length)

  useFrame(({ clock }) => {
    const group = ref.current
    if (!group || !item.quiet) return
    const focused = useSpatialStore.getState().activeProjectId !== null
    const tempo = focused ? 0.22 : 0.42
    const t = clock.elapsedTime
    group.position.set(
      position[0],
      position[1] + Math.sin(t * tempo + phase.current) * 0.18,
      position[2] + Math.cos(t * tempo * 0.7 + phase.current) * 0.08,
    )
  })

  return (
    <group ref={ref} position={position}>
      <Html
        center
        distanceFactor={6}
        zIndexRange={[24, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <ProjectCard item={item} />
      </Html>
    </group>
  )
}

function DiscoBall({ cards }: { cards: GalleryCard[] }) {
  const ref = useRef<Group>(null)
  const spin = useRef(0)
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useRef(
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const placements = cards.map((item, index) => ({
    item,
    position: fibonacciSphere(index, cards.length, SPHERE_RADIUS),
  }))

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useFrame((_, delta) => {
    const group = ref.current
    if (!group) return
    // Read Zustand outside React so pausing the ball does not re-render the hero.
    const focused = useSpatialStore.getState().activeProjectId !== null
    const goal = reduceMotion.current ? 0 : focused ? 0.1 : 0.32
    const blend = 1 - Math.exp(-delta * 7)
    spin.current += (goal - spin.current) * blend
    group.rotation.y += delta * spin.current
  })

  return (
    <group ref={ref}>
      {mounted && placements.map(({ item, position }) => (
        <Thumbnail key={item.id} item={item} position={position} />
      ))}
    </group>
  )
}

function FrameCamera() {
  const camera = useThree((state) => state.camera)
  const width = useThree((state) => state.size.width)

  useLayoutEffect(() => {
    camera.position.z = width < 520 ? 11.2 : 8.4
    camera.updateProjectionMatrix()
  }, [camera, width])

  return null
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
        camera={{ position: [0, 0.35, 8.4], fov: 36 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          if (exiting || still) return
          const state = useSpatialStore.getState()
          if (state.activeProjectId) state.setActiveProject(null)
          else state.closeOverlay()
        }}
      >
        <FrameCamera />
        <FlowField exiting={exiting} />
        {!still && <DiscoBall cards={cards} />}
      </Canvas>
    </div>
  )
}
