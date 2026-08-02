import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  HistoryTimeline,
  type HistoryEra,
} from './HistoryTimeline'
import './DetailPage.css'

export type DetailSectionBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'code'; code: string; label?: string }
  | {
      type: 'imageGrid'
      images: { src: string; caption?: string }[]
    }
  | {
      type: 'historyTimeline'
      eras: HistoryEra[]
      hint?: string
    }

export interface DetailSection {
  heading: string
  text?: string
  paragraphs?: string[]
  image?: string
  caption?: string
  images?: { src: string; caption?: string }[]
  /** Ordered mix of text, images, and code — preferred when interleaving is needed */
  blocks?: DetailSectionBlock[]
  /** Inline act / step timeline rendered inside this section */
  timelineSteps?: DetailTimelineStep[]
}

export interface DetailTimelineStep {
  title: string
  text: string
  image?: string
  caption?: string
  /** Marks steps that belong to the repeating core loop */
  loop?: boolean
}

export interface DetailGalleryItem {
  src: string
  caption?: string
}

interface DetailPageProps {
  backTo: string
  backLabel: string
  backState?: { scrollTo?: string }
  eyebrow: string
  title: string
  subtitle?: string
  lead?: string
  meta?: string[]
  image?: string
  imageAlt?: string
  body?: string[]
  sections?: DetailSection[]
  timeline?: DetailTimelineStep[]
  timelineTitle?: string
  gallery?: DetailGalleryItem[] | string[]
  galleryTitle?: string
  epilogue?: {
    heading: string
    paragraphs: string[]
    image?: string
  }
  tags?: string[]
  externalLink?: {
    href: string
    label: string
  }
  children?: ReactNode
}

type TimelineBlock =
  | { type: 'step'; step: DetailTimelineStep; index: number }
  | { type: 'loop'; steps: { step: DetailTimelineStep; index: number }[] }

function highlightCodePlaceholders(code: string) {
  const parts = code.split(/(\{[^}]+\})/g)
  return parts.map((part, index) =>
    part.startsWith('{') && part.endsWith('}') ? (
      <span key={`${part}-${index}`} className="detail-section__token">
        {part}
      </span>
    ) : (
      <span key={`plain-${index}`}>{part}</span>
    ),
  )
}

function normalizeGallery(
  gallery?: DetailGalleryItem[] | string[],
): DetailGalleryItem[] {
  if (!gallery) return []
  return gallery.map((item) =>
    typeof item === 'string' ? { src: item } : item,
  )
}

function groupTimeline(timeline: DetailTimelineStep[]): TimelineBlock[] {
  const blocks: TimelineBlock[] = []
  let i = 0

  while (i < timeline.length) {
    const step = timeline[i]
    if (step.loop) {
      const steps: { step: DetailTimelineStep; index: number }[] = []
      while (i < timeline.length && timeline[i].loop) {
        steps.push({ step: timeline[i], index: i })
        i += 1
      }
      blocks.push({ type: 'loop', steps })
    } else {
      blocks.push({ type: 'step', step, index: i })
      i += 1
    }
  }

  return blocks
}

function TimelineStepRow({
  step,
  index,
}: {
  step: DetailTimelineStep
  index: number
}) {
  return (
    <li className="detail-timeline__item">
      <span className="detail-timeline__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="detail-timeline__content">
        <div className="detail-timeline__copy">
          <h3 className="detail-timeline__step">{step.title}</h3>
          <p className="detail-timeline__text">{step.text}</p>
        </div>
        {step.image && (
          <figure className="detail-timeline__figure">
            <img
              src={step.image}
              alt={step.caption ?? step.title}
              className="detail-timeline__image"
            />
            {step.caption && (
              <figcaption className="detail-timeline__caption">
                {step.caption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </li>
  )
}

export function DetailPage({
  backTo,
  backLabel,
  backState,
  eyebrow,
  title,
  subtitle,
  lead,
  meta,
  image,
  imageAlt = '',
  body = [],
  sections,
  timeline,
  timelineTitle = 'Flow',
  gallery,
  galleryTitle = 'Gallery',
  epilogue,
  tags,
  externalLink,
  children,
}: DetailPageProps) {
  const galleryItems = normalizeGallery(gallery)
  const timelineBlocks = timeline ? groupTimeline(timeline) : []

  return (
    <article className="detail">
      <div className="detail__inner">
        <Link to={backTo} state={backState} className="detail__back">
          ← {backLabel}
        </Link>

        <header className="detail__header">
          <span className="detail__eyebrow">{eyebrow}</span>
          <h1 className="detail__title">{title}</h1>
          {subtitle && <p className="detail__subtitle">{subtitle}</p>}
          {meta && meta.length > 0 && (
            <p className="detail__meta">{meta.join(' · ')}</p>
          )}
        </header>

        {lead && <p className="detail__lead">{lead}</p>}

        {externalLink && (
          <p className="detail__external detail__external--early">
            <a
              href={externalLink.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {externalLink.label}
            </a>
          </p>
        )}

        {image && (
          <figure className="detail__hero">
            <img src={image} alt={imageAlt} className="detail__hero-image" />
          </figure>
        )}

        {body.length > 0 && (
          <div className="detail__body">
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}

        {sections && sections.length > 0 && (
          <div className="detail__sections">
            {sections.map((section) => {
              const blocks =
                section.blocks && section.blocks.length > 0
                  ? section.blocks
                  : [
                      ...(
                        section.paragraphs && section.paragraphs.length > 0
                          ? section.paragraphs
                          : section.text
                            ? [section.text]
                            : []
                      ).map(
                        (text) =>
                          ({ type: 'text', text }) as const,
                      ),
                      ...(
                        section.images && section.images.length > 0
                          ? section.images
                          : section.image
                            ? [
                                {
                                  src: section.image,
                                  caption: section.caption,
                                },
                              ]
                            : []
                      ).map(
                        (figure) =>
                          ({
                            type: 'image',
                            src: figure.src,
                            caption: figure.caption,
                          }) as const,
                      ),
                    ]

              return (
                <section key={section.heading} className="detail-section">
                  <h2 className="detail-section__heading">{section.heading}</h2>
                  {blocks.map((block, index) => {
                    if (block.type === 'text') {
                      return (
                        <p
                          key={`text-${index}-${block.text.slice(0, 24)}`}
                          className="detail-section__text"
                        >
                          {block.text}
                        </p>
                      )
                    }

                    if (block.type === 'code') {
                      return (
                        <figure
                          key={`code-${index}`}
                          className="detail-section__code"
                        >
                          {block.label && (
                            <figcaption className="detail-section__code-label">
                              {block.label}
                            </figcaption>
                          )}
                          <pre className="detail-section__pre">
                            <code>{highlightCodePlaceholders(block.code)}</code>
                          </pre>
                        </figure>
                      )
                    }

                    if (block.type === 'imageGrid') {
                      const count = Math.min(Math.max(block.images.length, 1), 3)
                      return (
                        <div
                          key={`grid-${index}`}
                          className={`detail-section__grid detail-section__grid--${count}`}
                        >
                          {block.images.map((figure) => (
                            <figure
                              key={figure.src}
                              className="detail-section__grid-item"
                            >
                              <img
                                src={figure.src}
                                alt={figure.caption ?? ''}
                                className="detail-section__grid-image"
                              />
                              {figure.caption && (
                                <figcaption className="detail-section__caption">
                                  {figure.caption}
                                </figcaption>
                              )}
                            </figure>
                          ))}
                        </div>
                      )
                    }

                    if (block.type === 'historyTimeline') {
                      return (
                        <HistoryTimeline
                          key={`history-${index}`}
                          eras={block.eras}
                          hint={block.hint}
                        />
                      )
                    }

                    return (
                      <figure
                        key={block.src}
                        className="detail-section__figure"
                      >
                        <img
                          src={block.src}
                          alt={block.caption ?? ''}
                          className="detail-section__image"
                        />
                        {block.caption && (
                          <figcaption className="detail-section__caption">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    )
                  })}
                  {section.timelineSteps && section.timelineSteps.length > 0 && (
                    <div className="detail-timeline detail-timeline--inline">
                      <ol className="detail-timeline__list">
                        {section.timelineSteps.map((step, stepIndex) => (
                          <TimelineStepRow
                            key={step.title}
                            step={step}
                            index={stepIndex}
                          />
                        ))}
                      </ol>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}

        {timelineBlocks.length > 0 && (
          <section className="detail-timeline">
            <h2 className="detail-timeline__title">{timelineTitle}</h2>
            <div className="detail-timeline__blocks">
              {timelineBlocks.map((block) => {
                if (block.type === 'loop') {
                  return (
                    <div
                      key={`loop-${block.steps[0].index}`}
                      className="detail-timeline__loop"
                    >
                      <div className="detail-timeline__loop-header">
                        <span className="detail-timeline__loop-label">
                          Core loop
                        </span>
                        <span className="detail-timeline__loop-hint">
                          Repeats for each customer · 02–05
                        </span>
                      </div>
                      <ol className="detail-timeline__list detail-timeline__list--loop">
                        {block.steps.map(({ step, index }) => (
                          <TimelineStepRow
                            key={step.title}
                            step={step}
                            index={index}
                          />
                        ))}
                      </ol>
                    </div>
                  )
                }

                return (
                  <ol
                    key={block.step.title}
                    className="detail-timeline__list"
                  >
                    <TimelineStepRow step={block.step} index={block.index} />
                  </ol>
                )
              })}
            </div>
          </section>
        )}

        {children}

        {galleryItems.length > 0 && (
          <section className="detail__gallery-wrap">
            <h2 className="detail__gallery-title">{galleryTitle}</h2>
            <div className="detail__gallery" tabIndex={0}>
              {galleryItems.map((item) => (
                <figure key={item.src} className="detail__gallery-item">
                  <img
                    src={item.src}
                    alt={item.caption ?? ''}
                    className="detail__gallery-image"
                  />
                  {item.caption && (
                    <figcaption className="detail__gallery-caption">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {epilogue && (
          <section className="detail-epilogue">
            <h2 className="detail-epilogue__heading">{epilogue.heading}</h2>
            <div className="detail-epilogue__body">
              {epilogue.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {epilogue.image && (
              <figure className="detail-epilogue__figure">
                <img
                  src={epilogue.image}
                  alt={epilogue.heading}
                  className="detail-epilogue__image"
                />
              </figure>
            )}
          </section>
        )}

        {tags && tags.length > 0 && (
          <div className="detail__tags">
            {tags.map((tag) => (
              <span key={tag} className="detail__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
