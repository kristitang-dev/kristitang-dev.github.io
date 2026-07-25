import { useRef } from 'react'
import { useSpotlight } from '../../hooks/useSpotlight'
import { HeroContent } from './HeroContent'
import './Hero.css'

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const chairRef = useRef<SVGCircleElement>(null)

  useSpotlight(containerRef, chairRef)

  return (
    <section
      id="home"
      className="hero"
      ref={containerRef}
      aria-label="Interactive hero"
    >
      <div className="hero__layer hero__layer--blueprint">
        <HeroContent />
      </div>

      <div className="hero__layer hero__layer--reality">
        <HeroContent chairRef={chairRef} />
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
