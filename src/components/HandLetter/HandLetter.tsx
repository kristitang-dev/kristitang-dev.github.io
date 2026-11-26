import type { CSSProperties } from 'react'
import './HandLetter.css'

type Frame = { lines: string[]; src?: string; alt: string }

/**
 * Turns a run of "## line" headings and images into frames: the headings that
 * come before an image become that frame's handwritten caption.
 */
function parseFrames(markdown: string): Frame[] {
  const frames: Frame[] = []
  let pending: string[] = []
  for (const raw of markdown.split('\n')) {
    const line = raw.trim()
    const heading = line.match(/^#{2,3}\s+(.*)$/)
    if (heading) {
      pending.push(heading[1].replace(/？/g, '?').trim())
      continue
    }
    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/)
    if (image) {
      frames.push({ lines: pending, src: image[2], alt: image[1] })
      pending = []
    }
  }
  if (pending.length > 0) frames.push({ lines: pending, alt: '' })
  return frames
}

// A slight, fixed tilt per frame, like prints laid on a page.
const tilts = [-1.6, 1.1, -0.7, 1.4, -1.1, 0.8]

/**
 * A letter-paper sheet of instant-photo frames with handwritten captions.
 * Without a `greeting`, the letter's first heading opens it instead.
 */
export function HandLetter({ markdown, greeting }: { markdown: string; greeting?: string }) {
  const parsed = parseFrames(markdown)
  let opening = greeting
  if (!opening && parsed[0]?.lines.length) {
    opening = parsed[0].lines[0]
    parsed[0] = { ...parsed[0], lines: parsed[0].lines.slice(1) }
  }
  const frames = parsed.filter((frame) => frame.src || frame.lines.length > 0)
  if (frames.length === 0) return null

  return (
    <section className="hand-letter">
      {opening && <h2 className="hand-letter__greeting">{opening}</h2>}
      <ol className="hand-letter__frames">
        {frames.map((frame, index) => (
          <li
            key={`${frame.src ?? 'text'}-${index}`}
            className="hand-letter__frame"
            style={{ '--tilt': `${tilts[index % tilts.length]}deg` } as CSSProperties}
          >
            <figure>
              {frame.src && (
                <div className="hand-letter__photo">
                  <img src={frame.src} alt={frame.alt} loading="lazy" />
                </div>
              )}
              <figcaption>
                {frame.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <span className="hand-letter__no" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  )
}
