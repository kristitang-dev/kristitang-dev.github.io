import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getEntryKindLabel, type CatalogEntry } from '../../data/entry'
import { returnLinkProps } from '../../store/spatialStore'
import { sandboxEntries } from '../../data/sandbox'
import './DigitalGarden.css'

export function GardenCardLink({
  entry,
  className,
  section = 'bookshelf',
  children,
}: {
  entry: CatalogEntry
  className?: string
  section?: string
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
    <Link
      {...returnLinkProps(`/garden/${entry.id}`, { kind: 'section', section })}
      className={className}
    >
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
              className={`garden-card${entry.image || entry.preview ? '' : ' garden-card--text'}`}
            >
              {(entry.image || entry.preview) && (
                <GardenCardLink entry={entry} section="sandbox" className="garden-card__media-link">
                  <div className="garden-card__media">
                    {entry.preview ? (
                      <iframe
                        src={entry.preview}
                        title={`${entry.title} live preview`}
                        className="garden-card__preview"
                        loading="lazy"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                    ) : (
                      <img
                        src={entry.image}
                        alt=""
                        className="garden-card__image"
                        loading="lazy"
                      />
                    )}
                  </div>
                </GardenCardLink>
              )}

              <div className="garden-card__body">
                <span className="garden-card__kind">{getEntryKindLabel(entry)}</span>
                <h3 className="garden-card__title">
                  <GardenCardLink entry={entry} section="sandbox">{entry.title}</GardenCardLink>
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
