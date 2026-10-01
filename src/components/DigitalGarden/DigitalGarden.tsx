import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { gardenEntries, getGardenKindLabel, type GardenEntry } from '../../data/garden'
import { site } from '../../data/site'
import './DigitalGarden.css'

function GardenCardLink({
  entry,
  className,
  children,
}: {
  entry: GardenEntry
  className?: string
  children: ReactNode
}) {
  if (entry.redirect && entry.link) {
    return (
      <a
        href={entry.link}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <Link to={`/garden/${entry.id}`} className={className}>
      {children}
    </Link>
  )
}

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
                <GardenCardLink entry={entry} className="garden-card__media-link">
                  <div className="garden-card__media">
                    <img
                      src={entry.image}
                      alt=""
                      className="garden-card__image"
                      loading="lazy"
                    />
                  </div>
                </GardenCardLink>
              )}

              <div className="garden-card__body">
                <span className="garden-card__kind">{getGardenKindLabel(entry)}</span>
                <h3 className="garden-card__title">
                  <GardenCardLink entry={entry}>{entry.title}</GardenCardLink>
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

        <p className="garden__more">
          See more unsorted photography works{' '}
          <a
            href={site.instagramUrl}
            className="garden__more-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {site.instagramHandle}
          </a>
        </p>
      </div>
    </section>
  )
}
