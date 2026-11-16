import './PalomaFlip.css'

const pairs = [
  { word: 'Disconnected', answer: 'Connect with fellow commuter' },
  { word: 'Repeated', answer: 'Unexpectedness and delight' },
  { word: 'Long', answer: 'Something that you look forward to' },
] as const

/** Problem words, then the same words crossed into “How might we.” */
export function PalomaFlip() {
  return (
    <figure className="paloma-flip" aria-label="From the problem to how might we">
      <p className="paloma-flip__label paloma-flip__label--problem">Problem</p>
      <p className="paloma-flip__label paloma-flip__label--hmw">How might we</p>
      <ul className="paloma-flip__row">
        {pairs.map((pair) => (
          <li key={pair.word} className="paloma-flip__item">
            <span className="paloma-flip__word">
              {pair.word}
              <span className="paloma-flip__strike" aria-hidden="true" />
            </span>
            <span className="paloma-flip__answer">{pair.answer}</span>
          </li>
        ))}
      </ul>
      <figcaption className="paloma-flip__caption">
        Each pain point, flipped into a “how might we.”
      </figcaption>
    </figure>
  )
}
