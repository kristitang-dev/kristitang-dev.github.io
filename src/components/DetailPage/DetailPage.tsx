import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  HistoryTimeline,
  type HistoryEra,
} from './HistoryTimeline'
import './DetailPage.css'

export type DetailSectionBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; caption?: string; fullBleed?: boolean }
  | { type: 'code'; code: string; label?: string }
  | {
      type: 'imageGrid'
      images: { src: string; caption?: string }[]
      /** height = equal crop height; width = full image, equal column width */
      fit?: 'height' | 'width'
    }
  | {
      type: 'historyTimeline'
      eras: HistoryEra[]
      hint?: string
    }
  | {
      type: 'split'
      text: string
      image: string
      caption?: string
      /** text-image = words left; image-text = picture left */
      layout?: 'text-image' | 'image-text'
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
  /** dark = black band (e.g. SoMo from Solution onward) */
  theme?: 'light' | 'dark'
}

export interface DetailTimelineStep {
  title: string
  text: string
  image?: string
  caption?: string
  /** Marks steps that belong to the repeating core loop */
  loop?: boolean
  /** side = thumbnail beside copy (default); below = full-width under copy */
  imagePlacement?: 'side' | 'below'
}

export interface DetailGalleryItem {
  src: string
  caption?: string
}

/** scroll = strip; 1x1 = one full-width image; 2x1/3x1/4x1 = column grids */
export type DetailGalleryLayout = 'scroll' | '1x1' | '2x1' | '3x1' | '4x1'

/** One gallery band on a detail page — mix several with different layouts */
export interface DetailGalleryBlock {
  layout: DetailGalleryLayout
  title?: string
  images: DetailGalleryItem[] | string[]
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
  body?: Array<
    | string
    | { type: 'image'; src: string; caption?: string }
    | {
        type: 'split'
        text: string
        image: string
        caption?: string
        layout?: 'text-image' | 'image-text'
      }
  >
  sections?: DetailSection[]
  timeline?: DetailTimelineStep[]
  timelineTitle?: string
  /** Simple single gallery (still supported) */
  gallery?: DetailGalleryItem[] | string[]
  galleryTitle?: string
  galleryLayout?: DetailGalleryLayout
  /** Preferred: stack multiple layouts (2x1 + 1x1 + 3x1, etc.) */
  galleryBlocks?: DetailGalleryBlock[]
  /** From this section heading to the end of the page, use a black band */
  darkBandFrom?: string
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

function isPhotoGridLayout(layout: DetailGalleryLayout) {
  return (
    layout === '1x1' ||
    layout === '2x1' ||
    layout === '3x1' ||
    layout === '4x1'
  )
}

function resolveGalleryBlocks(
  galleryBlocks: DetailGalleryBlock[] | undefined,
  gallery: DetailGalleryItem[] | string[] | undefined,
  galleryTitle: string | undefined,
  galleryLayout: DetailGalleryLayout,
): { layout: DetailGalleryLayout; title?: string; images: DetailGalleryItem[] }[] {
  if (galleryBlocks && galleryBlocks.length > 0) {
    return galleryBlocks.map((block) => ({
      layout: block.layout,
      title: block.title,
      images: normalizeGallery(block.images),
    }))
  }

  const images = normalizeGallery(gallery)
  if (images.length === 0) return []

  return [
    {
      layout: galleryLayout,
      title: galleryTitle,
      images,
    },
  ]
}

function GalleryBlockView({
  layout,
  title,
  images,
  blockIndex,
}: {
  layout: DetailGalleryLayout
  title?: string
  images: DetailGalleryItem[]
  blockIndex: number
}) {
  if (images.length === 0) return null

  const isGrid = isPhotoGridLayout(layout)

  return (
    <section
      className={`detail__gallery-wrap${isGrid ? ' detail__gallery-wrap--grid' : ''}`}
    >
      {title ? <h2 className="detail__gallery-title">{title}</h2> : null}
      <div
        className={
          isGrid
            ? `detail__gallery detail__gallery--${layout}`
            : 'detail__gallery'
        }
        tabIndex={isGrid ? undefined : 0}
      >
        {images.map((item, itemIndex) => (
          <figure
            key={`${blockIndex}-${item.src}-${itemIndex}`}
            className="detail__gallery-item"
          >
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
  const placement = step.imagePlacement ?? 'side'

  return (
    <li className="detail-timeline__item">
      <span className="detail-timeline__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div
        className={`detail-timeline__content detail-timeline__content--${placement}`}
      >
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

function DetailSectionView({ section }: { section: DetailSection }) {
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
          ).map((text) => ({ type: 'text', text }) as const),
          ...(
            section.images && section.images.length > 0
              ? section.images
              : section.image
                ? [{ src: section.image, caption: section.caption }]
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
    <section
      className={`detail-section${section.theme === 'dark' ? ' detail-section--dark' : ''}`}
    >
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
            <figure key={`code-${index}`} className="detail-section__code">
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
          const fit = block.fit ?? 'height'
          return (
            <div
              key={`grid-${index}`}
              className={`detail-section__grid detail-section__grid--${count} detail-section__grid--fit-${fit}`}
            >
              {block.images.map((figure) => (
                <figure key={figure.src} className="detail-section__grid-item">
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

        if (block.type === 'split') {
          const layout = block.layout ?? 'text-image'
          const textEl = (
            <p className="detail-section__split-text">{block.text}</p>
          )
          const imageEl = (
            <figure className="detail-section__split-figure">
              <img
                src={block.image}
                alt={block.caption ?? ''}
                className="detail-section__split-image"
              />
              {block.caption && (
                <figcaption className="detail-section__caption">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )

          return (
            <div
              key={`split-${index}`}
              className={`detail-section__split detail-section__split--${layout}`}
            >
              {layout === 'image-text' ? (
                <>
                  {imageEl}
                  {textEl}
                </>
              ) : (
                <>
                  {textEl}
                  {imageEl}
                </>
              )}
            </div>
          )
        }

        return (
          <figure
            key={block.src}
            className={`detail-section__figure${block.fullBleed ? ' detail-section__figure--full-bleed' : ''}`}
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
  galleryLayout = 'scroll',
  galleryBlocks,
  darkBandFrom,
  epilogue,
  tags,
  externalLink,
  children,
}: DetailPageProps) {
  const blocks = resolveGalleryBlocks(
    galleryBlocks,
    gallery,
    galleryTitle,
    galleryLayout,
  )
  const timelineBlocks = timeline ? groupTimeline(timeline) : []
  const usesPhotoGrid = blocks.some((block) => isPhotoGridLayout(block.layout))

  const darkIndex =
    darkBandFrom && sections
      ? sections.findIndex((section) => section.heading === darkBandFrom)
      : -1
  const hasDarkBand = darkIndex >= 0
  const lightSections =
    hasDarkBand && sections ? sections.slice(0, darkIndex) : sections
  const darkSections =
    hasDarkBand && sections ? sections.slice(darkIndex) : []

  const pageTimeline =
    timelineBlocks.length > 0 ? (
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
              <ol key={block.step.title} className="detail-timeline__list">
                <TimelineStepRow step={block.step} index={block.index} />
              </ol>
            )
          })}
        </div>
      </section>
    ) : null

  const pageGallery = blocks.map((block, blockIndex) => (
    <GalleryBlockView
      key={`gallery-block-${blockIndex}`}
      layout={block.layout}
      title={block.title}
      images={block.images}
      blockIndex={blockIndex}
    />
  ))

  const pageEpilogue = epilogue ? (
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
  ) : null

  const pageTags =
    tags && tags.length > 0 ? (
      <div className="detail__tags">
        {tags.map((tag) => (
          <span key={tag} className="detail__tag">
            {tag}
          </span>
        ))}
      </div>
    ) : null

  return (
    <article className={`detail${usesPhotoGrid ? ' detail--photo-grid' : ''}`}>
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
            {body.map((block, index) => {
              if (typeof block === 'string') {
                return <p key={`body-text-${index}`}>{block}</p>
              }

              if (block.type === 'image') {
                return (
                  <figure
                    key={`body-image-${index}`}
                    className="detail__body-figure"
                  >
                    <img
                      src={block.src}
                      alt={block.caption ?? ''}
                      className="detail__body-image"
                    />
                    {block.caption && (
                      <figcaption className="detail-section__caption">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              const layout = block.layout ?? 'text-image'
              const textEl = (
                <p className="detail-section__split-text">{block.text}</p>
              )
              const imageEl = (
                <figure className="detail-section__split-figure">
                  <img
                    src={block.image}
                    alt={block.caption ?? ''}
                    className="detail-section__split-image"
                  />
                  {block.caption && (
                    <figcaption className="detail-section__caption">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )

              return (
                <div
                  key={`body-split-${index}`}
                  className={`detail-section__split detail-section__split--${layout}`}
                >
                  {layout === 'image-text' ? (
                    <>
                      {imageEl}
                      {textEl}
                    </>
                  ) : (
                    <>
                      {textEl}
                      {imageEl}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {lightSections && lightSections.length > 0 && (
          <div className="detail__sections">
            {lightSections.map((section) => (
              <DetailSectionView key={section.heading} section={section} />
            ))}
          </div>
        )}

        {!hasDarkBand && (
          <>
            {pageTimeline}
            {children}
            {pageGallery}
            {pageEpilogue}
            {pageTags}
          </>
        )}
      </div>

      {hasDarkBand && (
        <div className="detail__dark-band">
          <div className="detail__dark-band-inner">
            {darkSections.length > 0 && (
              <div className="detail__sections">
                {darkSections.map((section) => (
                  <DetailSectionView
                    key={section.heading}
                    section={{ ...section, theme: 'dark' }}
                  />
                ))}
              </div>
            )}
            {pageTimeline}
            {children}
            {pageGallery}
            {pageEpilogue}
            {pageTags}
          </div>
        </div>
      )}
    </article>
  )
}
