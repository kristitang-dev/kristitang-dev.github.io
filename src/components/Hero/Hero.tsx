import { HeroContent } from './HeroContent'
import { HeroScene } from './HeroScene'
import './Hero.css'
import './HeroContent.css'

export function Hero() {
  return (
    <section id="home" className="hero" aria-label="Interactive hero">
      <HeroContent />

      <div className="hero__scene-layer">
        <div className="hero-scene">
          <HeroScene />
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
