import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCategoryLabels,
  workFilters,
  workItems,
  type WorkCategory,
} from '../../data/work'
import './Work.css'

export function Work() {
  const [filter, setFilter] = useState<WorkCategory>('all')

  const visible = useMemo(
    () =>
      [...(filter === 'all'
        ? workItems
        : workItems.filter((item) => item.categories.includes(filter)))].sort(
        (a, b) => b.sortDate.localeCompare(a.sortDate),
      ),
    [filter],
  )

  return (
    <section id="work" className="work">
      <div className="work__inner">
        <div className="work__header">
          <div className="work__titles">
            <span className="work__eyebrow">The Medium</span>
            <h2 className="work__title">Work</h2>
            <p className="work__intro">
              Digital work across VR/MR, games, and assistive tech — where design meets computation.
            </p>
          </div>

          <div className="work__filters" role="tablist" aria-label="Filter work">
            {workFilters.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={`work__filter${filter === id ? ' is-active' : ''}`}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ul className="work__grid">
          {visible.map((item) => (
            <li key={item.id} className="work-card">
              <article>
                <Link to={`/work/${item.id}`} className="work-card__media-link">
                  <div className="work-card__media">
                    <img
                      src={item.image}
                      alt=""
                      className="work-card__image"
                      loading="lazy"
                    />
                    <span className="work-card__category">
                      {getCategoryLabels(item).join(' · ')}
                    </span>
                  </div>
                </Link>

                <div className="work-card__body">
                  <div className="work-card__meta">
                    <span>{item.period}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.type}</span>
                  </div>

                  <h3 className="work-card__title">
                    <Link to={`/work/${item.id}`}>{item.title}</Link>
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

                  <p className="work-card__tools">{item.tools.join(' · ')}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
