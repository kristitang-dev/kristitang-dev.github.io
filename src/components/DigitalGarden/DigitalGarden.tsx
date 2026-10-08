import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getEntryKindLabel, type CatalogEntry } from '../../data/entry'
import { sandboxEntries } from '../../data/sandbox'
import './DigitalGarden.css'

export function GardenCardLink({
  entry,
  className,
  children,
}: {
  entry: CatalogEntry
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
    <section id="sandbox" className="garden">
      <div className="garden__inner">
        <div className="garden__header">
          <span className="garden__eyebrow">Experiments</span>
          <h2 className="garden__title">Sandbox</h2>
          <p className="garden__intro">
            Game jams and experiments
          </p>
        </div>

        <div className="garden__grid">
          {sandboxEntries.map((entry) => (
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
                <span className="garden-card__kind">{getEntryKindLabel(entry)}</span>
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
      </div>
    </section>
  )
}
