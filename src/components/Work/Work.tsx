import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { workItems } from '../../data/work'
import { returnLinkProps, useSpatialStore } from '../../store/spatialStore'
import './Work.css'

export function Work() {
  const visible = useMemo(
    () =>
      workItems
        .filter((item) => item.featured)
        .sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
    [],
  )

  return (
    <section id="work" className="work">
      <div className="work__inner">
        <div className="work__header">
          <div className="work__titles">
            <h2 className="work__title">Featured Work</h2>
            <p className="work__intro">
              Digital work across VR/MR, games, and assistive tech — where design meets computation.
            </p>
          </div>
        </div>

        <ul className="work__grid">
          {visible.map((item) => (
            <li key={item.id} className="work-card">
              <article>
                <Link
                  {...returnLinkProps(`/work/${item.id}`, { kind: 'section', section: 'work' })}
                  className="work-card__media-link"
                >
                  <div className="work-card__media">
                    <img
                      src={item.image}
                      alt=""
                      className="work-card__image"
                      loading="lazy"
                    />
                    {item.tools.length > 0 && (
                      <span className="work-card__tools">
                        {item.tools.map((tool) => (
                          <span key={tool} className="work-card__tool">
                            {tool}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="work-card__body">
                  <div className="work-card__meta">
                    <span>{item.period}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.type}</span>
                  </div>

                  <h3 className="work-card__title">
                    <Link
                      {...returnLinkProps(`/work/${item.id}`, { kind: 'section', section: 'work' })}
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="work-card__subtitle">{item.subtitle}</p>
                  <p className="work-card__desc">{item.description}</p>

                  <div className="work-card__tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="work-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              </article>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="work__more"
          onClick={() => useSpatialStore.getState().setActiveOverlay('laptop')}
        >
          See more of my work
        </button>
      </div>
    </section>
  )
}
