import { useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Markdown from 'react-markdown'
import { ExternalRedirect } from '../components/ExternalRedirect'
import { ReadingRail } from '../components/ReadingRail/ReadingRail'
import { HandLetter } from '../components/HandLetter/HandLetter'
import { getPost } from '../content/loadPosts'
import { getCatalogEntry } from '../data/catalog'
import './Blog.css'

// Posts where the line right after an image is styled as a caption
const captionSlugs = new Set(['develop-by-hand', 'creative-inquiry-evergreen'])


/** Splits a post at the heading named in `letterFrom` (full-width ？ counts as ?). */
function splitAtLetter(markdown: string, letterFrom?: string) {
  if (!letterFrom) return { body: markdown, letter: '' }
  const target = letterFrom.replace(/\uFF1F/g, '?').trim()
  const lines = markdown.split('\n')
  const at = lines.findIndex((line) => {
    const heading = line.match(/^#{2,3}\s+(.*)$/)
    return heading ? heading[1].replace(/\uFF1F/g, '?').trim() === target : false
  })
  if (at === -1) return { body: markdown, letter: '' }
  return { body: lines.slice(0, at).join('\n'), letter: lines.slice(at).join('\n') }
}

/** Only a Drive file preview is embedded. Other URLs are ignored. */
function drivePreviewSrc(url: string | undefined) {
  if (!url) return undefined
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return undefined
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'drive.google.com') return undefined
  if (!/^\/file\/d\/[^/]+\/preview$/.test(parsed.pathname)) return undefined
  return parsed.toString()
}

export function BlogPostPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>()
  const series = id ? getCatalogEntry(id) : undefined
  const post = id && slug ? getPost(id, slug) : undefined
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id, slug])

  if (!series?.blog || !post) {
    return <Navigate to={id ? `/garden/${id}` : '/'} replace />
  }

  const redirectUrl = post.redirect
  if (redirectUrl) {
    return <ExternalRedirect url={redirectUrl} />
  }

  const videoSrc = drivePreviewSrc(post.video)
  const { body, letter } = splitAtLetter(post.markdown, post.letterFrom)

  return (
    <main className="blog">
      <article ref={articleRef} className="blog__inner">
        <ReadingRail
          targetRef={articleRef}
          headingSelector=".blog__prose h2, .hand-letter__greeting"
          back={{ to: `/garden/${series.id}`, label: series.title }}
        />
        <Link to={`/garden/${series.id}`} className="blog__back">
          ← {series.title}
        </Link>

        <time className="blog__date" dateTime={post.sortDate}>
          {post.date}
        </time>
        <h1 className="blog__title">{post.title}</h1>

        {videoSrc && (
          <div className="blog__video">
            <iframe
              src={videoSrc}
              title={post.title}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        )}

        <div
          className={`blog__prose${captionSlugs.has(post.slug) ? ' blog__prose--captions' : ''}`}
        >
          <Markdown
            components={
              post.slug === 'develop-by-hand'
                ? {
                    img: ({ src, alt }) => {
                      const url = typeof src === 'string' ? src : ''
                      const fullSize =
                        url.includes('anpoimages.com') ||
                        url.includes('/circuit.png') ||
                        url.includes('/prototype.png') ||
                        url.endsWith('/cover.jpg')
                      return (
                        <img
                          src={url}
                          alt={alt ?? ''}
                          className={fullSize ? undefined : 'blog__img--half'}
                        />
                      )
                    },
                  }
                : post.slug === 'genai-as-creative-material'
                  ? {
                      img: ({ src, alt }) => {
                        const url = typeof src === 'string' ? src : ''
                        const wide = /First%20Steps\.png|First Steps\.png|Saint-Remy\.png|Letter%20805\.png|Letter 805\.png|Generated/.test(url)
                        const small = url.includes('movingImage.gif')
                        if (url.includes('Photography-web.jpg')) {
                          return (
                            <a href={url} target="_blank" rel="noreferrer" className="blog__img-bleed">
                              <img src={url} alt={alt ?? ''} />
                            </a>
                          )
                        }
                        return (
                          <img
                            src={url}
                            alt={alt ?? ''}
                            width={small ? 240 : undefined}
                            height={small ? 138 : undefined}
                            className={wide ? 'blog__img--wide' : small ? 'blog__img--small' : undefined}
                          />
                        )
                      },
                    }
                  : post.slug === 'time-capsule'
                    ? {
                        img: ({ src, alt }) => {
                          const url = typeof src === 'string' ? src : ''
                          const wide = /Finding|Misinterpretation|organs|objects-curated|manifest/.test(url)
                          return (
                            <img
                              src={url}
                              alt={alt ?? ''}
                              className={wide ? 'blog__img--wide' : undefined}
                            />
                          )
                        },
                      }
                    : undefined
            }
          >
            {body}
          </Markdown>
        </div>

        {letter && <HandLetter markdown={letter} greeting={post.letterGreeting} />}
      </article>
    </main>
  )
}
