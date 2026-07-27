import { site } from '../../data/site'
import './HeroContent.css'

/** Text + layout only — the full-color scene is rendered separately above the spotlight. */
export function HeroContent() {
  return (
    <div className="hero-content">
      <div className="hero-content__left">
        <div className="hero-copy">
          <h1 className="hero-copy__name">{site.name}</h1>
          <p className="hero-copy__title">{site.title}</p>
          <p className="hero-copy__tagline">
            Between <em>Matter</em> &amp; <em>Medium</em>
          </p>
        </div>
      </div>

      {/* Spacer keeps the same split layout while the real scene sits in an overlay layer */}
      <div className="hero-content__right" aria-hidden="true">
        <div className="hero-scene hero-scene--spacer" />
      </div>
    </div>
  )
}
