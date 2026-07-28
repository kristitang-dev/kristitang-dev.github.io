import { site } from '../../data/site'
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
            <img
              src="/images/about.jpg"
              alt={`${site.name}`}
              className="about__portrait-img"
            />
          </div>

          <div className="about__text">
            <p className="about__lead">{site.about.lead}</p>
            {site.about.body.map((paragraph) => (
              <p key={paragraph} className="about__body">
                {paragraph}
              </p>
            ))}

            {site.cvUrl && (
              <div className="about__cv">
                <a
                  href={site.cvUrl}
                  className="about__cv-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View My CV
                </a>
              </div>
            )}

            <div className="about__tags">
              {site.about.skills.map((skill) => (
                <span key={skill} className="about__tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
