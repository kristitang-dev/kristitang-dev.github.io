import { Link } from 'react-router-dom'
import { gardenEntries } from '../../data/garden'
import './DigitalGarden.css'

export function DigitalGarden() {
  return (
    <section id="garden" className="garden">
      <div className="garden__inner">
        <div className="garden__header">
          <span className="garden__eyebrow">Personal</span>
          <h2 className="garden__title">Digital Garden</h2>
          <p className="garden__intro">
            A softer notebook for photography, video, game jams, and visual experiments —
            curated without the pressure of a finished project.
          </p>
        </div>

        <div className="garden__grid">
          {gardenEntries.map((entry) => (
            <article
              key={entry.id}
              className={`garden-card${entry.image ? '' : ' garden-card--text'}`}
            >
              {entry.image && (
                <Link to={`/garden/${entry.id}`} className="garden-card__media-link">
                  <div className="garden-card__media">
                    <img
                      src={entry.image}
                      alt=""
                      className="garden-card__image"
                      loading="lazy"
                    />
                  </div>
                </Link>
              )}

              <div className="garden-card__body">
                <span className="garden-card__kind">{entry.kind}</span>
                <h3 className="garden-card__title">
                  <Link to={`/garden/${entry.id}`}>{entry.title}</Link>
                </h3>
                <p className="garden-card__desc">{entry.description}</p>
                {entry.link && (
                  <a
                    href={entry.link}
                    className="garden-card__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {entry.linkLabel ?? 'Open link'}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
