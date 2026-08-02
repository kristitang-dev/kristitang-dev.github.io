import { useState, type ReactNode } from 'react'
import './HistoryTimeline.css'

export interface HistoryEraCase {
  title: string
  text: string
  image?: string
  caption?: string
  citation?: {
    href: string
    label?: string
  }
}

export interface HistoryEraDetail {
  text: string
  image?: string
  caption?: string
  citation?: {
    href: string
    label?: string
  }
}

export interface HistoryEra {
  era: string
  title: string
  summary: string
  details?: Array<string | HistoryEraDetail>
  /** Emphasize the final / contemporary era */
  highlight?: boolean
  cases?: HistoryEraCase[]
}

interface HistoryTimelineProps {
  eras: HistoryEra[]
  hint?: string
}

function normalizeDetail(detail: string | HistoryEraDetail): HistoryEraDetail {
  return typeof detail === 'string' ? { text: detail } : detail
}

function DetailBlock({ detail }: { detail: HistoryEraDetail }) {
  let body: ReactNode = detail.text

  if (detail.citation) {
    const label = detail.citation.label ?? 'Source'
    body = (
      <>
        {detail.text}{' '}
        <a
          href={detail.citation.href}
          className="history-timeline__cite"
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      </>
    )
  }

  return (
    <div className="history-timeline__detail">
      <p>{body}</p>
      {detail.image && (
        <figure className="history-timeline__figure">
          <img
            src={detail.image}
            alt={detail.caption ?? ''}
            className="history-timeline__image"
          />
          {detail.caption && (
            <figcaption className="history-timeline__caption">
              {detail.caption}
            </figcaption>
          )}
        </figure>
      )}
    </div>
  )
}

export function HistoryTimeline({
  eras,
  hint = 'Select an era to expand',
}: HistoryTimelineProps) {
  const [active, setActive] = useState(0)

  return (
    <div className="history-timeline">
      <p className="history-timeline__hint">{hint}</p>
      <ol className="history-timeline__list">
        {eras.map((era, index) => {
          const isOpen = active === index
          const panelId = `history-era-panel-${index}`
          const buttonId = `history-era-btn-${index}`

          return (
            <li
              key={era.era + era.title}
              className={
                era.highlight
                  ? 'history-timeline__item history-timeline__item--highlight'
                  : 'history-timeline__item'
              }
            >
              <button
                type="button"
                id={buttonId}
                className={
                  isOpen
                    ? 'history-timeline__trigger history-timeline__trigger--open'
                    : 'history-timeline__trigger'
                }
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setActive(index)}
              >
                <span className="history-timeline__dot" aria-hidden="true" />
                <span className="history-timeline__era">{era.era}</span>
                <span className="history-timeline__title">{era.title}</span>
                <span className="history-timeline__chevron" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="history-timeline__panel"
                >
                  <p className="history-timeline__summary">{era.summary}</p>
                  {era.details && era.details.length > 0 && (
                    <div className="history-timeline__details">
                      {era.details.map((detail, detailIndex) => {
                        const normalized = normalizeDetail(detail)
                        return (
                          <DetailBlock
                            key={`${normalized.text.slice(0, 32)}-${detailIndex}`}
                            detail={normalized}
                          />
                        )
                      })}
                    </div>
                  )}
                  {era.cases && era.cases.length > 0 && (
                    <ul className="history-timeline__cases">
                      {era.cases.map((item, caseIndex) => (
                        <li key={item.title} className="history-timeline__case">
                          <span className="history-timeline__case-index">
                            {caseIndex + 1}
                          </span>
                          <div>
                            <h4 className="history-timeline__case-title">
                              {item.title}
                              {item.citation && (
                                <>
                                  {' '}
                                  <a
                                    href={item.citation.href}
                                    className="history-timeline__cite"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {item.citation.label ?? 'Source →'}
                                  </a>
                                </>
                              )}
                            </h4>
                            <p className="history-timeline__case-text">
                              {item.text}
                            </p>
                            {item.image && (
                              <figure className="history-timeline__figure">
                                <img
                                  src={item.image}
                                  alt={item.caption ?? item.title}
                                  className="history-timeline__image history-timeline__image--wide"
                                />
                                {item.caption && (
                                  <figcaption className="history-timeline__caption">
                                    {item.caption}
                                  </figcaption>
                                )}
                              </figure>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
