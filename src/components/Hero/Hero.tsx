import { useRef } from 'react'
import { useSpotlight } from '../../hooks/useSpotlight'
import { HeroContent } from './HeroContent'
import './Hero.css'
import './HeroContent.css'

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const chairRef = useRef<HTMLSpanElement>(null)

  useSpotlight(containerRef, chairRef)

  return (
    <section
      id="home"
      className="hero"
      ref={containerRef}
      aria-label="Interactive hero"
    >
      {/* Spotlight layers: grayscale blueprint + color reveal (text / grid only) */}
      <div className="hero__layer hero__layer--blueprint">
        <HeroContent />
      </div>

      <div className="hero__layer hero__layer--reality">
        <HeroContent />
      </div>

      {/* Always full-color illustration — not affected by spotlight */}
      <div className="hero__scene-layer" aria-hidden="true">
        <div className="hero-scene">
          <img
            src="/images/hero-workspace.png"
            alt=""
            className="hero-scene__image"
            draggable={false}
          />
          <span ref={chairRef} className="chair-anchor" />
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
