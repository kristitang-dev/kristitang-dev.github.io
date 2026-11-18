import { HeroContent } from './HeroContent'
import { HeroScene } from './HeroScene'
import { SpatialLayer } from '../Spatial/SpatialLayer'
import './Hero.css'
import './HeroContent.css'

export function Hero() {
  const scrollDown = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('work')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section id="home" className="hero" aria-label="Interactive hero">
      <HeroContent />

      <div className="hero__scene-layer">
        <div className="hero-scene">
          <HeroScene />
        </div>
      </div>

      <button type="button" className="hero__scroll-hint" onClick={scrollDown} aria-label="Scroll to work">
        <span className="hero__scroll-line" aria-hidden="true" />
      </button>

      <SpatialLayer />
    </section>
  )
}
