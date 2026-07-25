import './About.css'

export function About() {
  return (
    <section id="about" className="about">
      <div className="about__inner">
        <div className="about__header">
          <span className="about__label">About</span>
          <div className="about__rule" aria-hidden="true" />
        </div>

        <div className="about__grid">
          <div className="about__portrait">
            <div className="about__portrait-placeholder" aria-hidden="true" />
          </div>

          <div className="about__text">
            <div className="about__placeholder-block about__placeholder-block--heading" />
            <div className="about__placeholder-block" />
            <div className="about__placeholder-block" />
            <div className="about__placeholder-block about__placeholder-block--short" />

            <div className="about__tags">
              <span className="about__tag">placeholder</span>
              <span className="about__tag">tag</span>
              <span className="about__tag">skills</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
