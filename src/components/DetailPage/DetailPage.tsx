import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './DetailPage.css'

interface DetailPageProps {
  backTo: string
  backLabel: string
  backState?: { scrollTo?: string }
  eyebrow: string
  title: string
  subtitle?: string
  meta?: string[]
  image?: string
  imageAlt?: string
  body: string[]
  gallery?: string[]
  tags?: string[]
  externalLink?: {
    href: string
    label: string
  }
  children?: ReactNode
}

export function DetailPage({
  backTo,
  backLabel,
  backState,
  eyebrow,
  title,
  subtitle,
  meta,
  image,
  imageAlt = '',
  body,
  gallery,
  tags,
  externalLink,
  children,
}: DetailPageProps) {
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

        {image && (
          <figure className="detail__hero">
            <img src={image} alt={imageAlt} className="detail__hero-image" />
          </figure>
        )}

        <div className="detail__body">
          {body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {children}
        </div>

        {gallery && gallery.length > 0 && (
          <div className="detail__gallery">
            {gallery.map((src) => (
              <img key={src} src={src} alt="" className="detail__gallery-image" />
            ))}
          </div>
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

        {externalLink && (
          <p className="detail__external">
            <a
              href={externalLink.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {externalLink.label}
            </a>
          </p>
        )}
      </div>
    </article>
  )
}
