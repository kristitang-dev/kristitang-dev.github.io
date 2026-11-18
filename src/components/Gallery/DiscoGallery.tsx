import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { GalleryCard } from './galleryItems'
import { useSpatialStore } from '../../store/spatialStore'
import { FlowField } from './FlowField'

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

/** The quiet dots behind the project grid. */
export function GalleryBackdrop({ exiting = false }: { exiting?: boolean }) {
  return (
    <div className="disco-gallery disco-gallery--behind" aria-hidden="true">
      <Canvas
        className="disco-gallery__canvas"
        camera={{ position: [0, 0, 8.8], fov: 36 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <FlowField exiting={exiting} calm />
      </Canvas>
    </div>
  )
}
