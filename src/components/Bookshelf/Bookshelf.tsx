import { albums, notebooks } from '../../data/bookshelf'
import { getEntryKindLabel } from '../../data/entry'
import { useSpatialStore } from '../../store/spatialStore'
import { GardenCardLink } from '../DigitalGarden/DigitalGarden'
import './Bookshelf.css'

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
          <div className="shelf__label-row">
            <h3 className="shelf__label">Albums</h3>
            <button
              type="button"
              className="shelf__gallery"
              onClick={() => useSpatialStore.getState().setActiveOverlay('camera')}
            >
              View gallery
            </button>
          </div>
          <ul className="shelf__albums">
            {albums.map((entry) => (
              <li key={entry.id} className="shelf-album">
                <GardenCardLink entry={entry} className="shelf-album__link">
                  <div className="shelf-album__cover">
                    {entry.image && (
                      <img src={entry.image} alt="" loading="lazy" />
                    )}
                  </div>
                  <span className="shelf-album__kind">{getEntryKindLabel(entry)}</span>
                  <span className="shelf-album__title">{entry.title}</span>
                </GardenCardLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
