import { gardenEntries, getGardenKindLabel } from '../../data/garden'
import { site } from '../../data/site'
import { GardenCardLink } from '../DigitalGarden/DigitalGarden'
import './Bookshelf.css'

const notebooks = gardenEntries.filter((entry) => entry.shelf === 'notebook')
const albums = gardenEntries.filter((entry) => entry.shelf === 'album')

export function Bookshelf() {
  return (
    <section id="bookshelf" className="shelf" aria-labelledby="bookshelf-title">
      <div className="shelf__inner">
        <header className="shelf__header">
          <span className="shelf__eyebrow">Notebooks &amp; albums</span>
          <h2 id="bookshelf-title" className="shelf__title">
            Bookshelf
          </h2>
        </header>

        <div className="shelf__row">
          <h3 className="shelf__label">Notebooks (Selected Coursework @NYU IDM)</h3>
          <ul className="shelf__notebooks">
            {notebooks.map((entry) => (
              <li key={entry.id} className="shelf-notebook">
                <GardenCardLink entry={entry} className="shelf-notebook__link">
                  <div className="shelf-notebook__cover">
                    <span className="shelf-notebook__label">
                      {entry.courseLabel ?? entry.title}
                    </span>
                    {entry.notebookCover && (
                      <span className="shelf-notebook__photo">
                        <img src={entry.notebookCover} alt="" loading="lazy" />
                      </span>
                    )}
                  </div>
                </GardenCardLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="shelf__row">
          <h3 className="shelf__label">Albums</h3>
          <ul className="shelf__albums">
            {albums.map((entry) => (
              <li key={entry.id} className="shelf-album">
                <GardenCardLink entry={entry} className="shelf-album__link">
                  <div className="shelf-album__cover">
                    {entry.image && (
                      <img src={entry.image} alt="" loading="lazy" />
                    )}
                  </div>
                  <span className="shelf-album__kind">{getGardenKindLabel(entry)}</span>
                  <span className="shelf-album__title">{entry.title}</span>
                </GardenCardLink>
              </li>
            ))}
          </ul>
          <p className="shelf__more">
            See more unsorted photography works{' '}
            <a
              href={site.instagramUrl}
              className="shelf__more-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {site.instagramHandle}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
