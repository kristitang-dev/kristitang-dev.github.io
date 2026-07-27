import { Link } from 'react-router-dom'
import { researchItems, researchKindLabels } from '../../data/research'
import './Research.css'

export function Research() {
  const sortedResearch = [...researchItems].sort((a, b) =>
    b.sortDate.localeCompare(a.sortDate),
  )

  return (
    <section id="research" className="research">
      <div className="research__inner">
        <div className="research__header">
          <span className="research__eyebrow">The Matter</span>
          <h2 className="research__title">Research &amp; Experience</h2>
          <p className="research__intro">
            Physical and data-driven work — publications, scale models, and academic practice.
          </p>
        </div>

        <ol className="research__timeline">
          {sortedResearch.map((item, index) => (
            <li key={item.id} className="research__item">
              <div className="research__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="research__content">
                <div className="research__meta">
                  <span className="research__kind">{researchKindLabels[item.kind]}</span>
                  {item.period && <span className="research__period">{item.period}</span>}
                  {item.status === 'placeholder' && (
                    <span className="research__status">Coming soon</span>
                  )}
                </div>

                <h3 className="research__item-title">
                  <Link to={`/research/${item.id}`}>{item.title}</Link>
                </h3>

                {item.image && (
                  <Link to={`/research/${item.id}`} className="research__thumb-link">
                    <img
                      src={item.image}
                      alt=""
                      className="research__thumb"
                      loading="lazy"
                    />
                  </Link>
                )}

                <p className="research__desc">
                  {item.description}
                  {item.doi && (
                    <>
                      {' '}
                      <a
                        href={item.doi}
                        className="research__doi"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.doi}
                      </a>
                    </>
                  )}
                </p>
                {item.contribution && (
                  <p className="research__desc research__desc--contribution">
                    {item.contribution}
                  </p>
                )}

                <div className="research__tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="research__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
