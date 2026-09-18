import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { getPostsBySeries } from '../content/loadPosts'
import { getGardenKindLabel, type GardenEntry } from '../data/garden'
import './Blog.css'

interface BlogSeriesProps {
  series: GardenEntry
}

export function BlogSeries({ series }: BlogSeriesProps) {
  const posts = getPostsBySeries(series.id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [series.id])

  return (
    <main className="blog">
      <div className="blog__inner">
        <Link to="/" className="blog__back" state={{ scrollTo: 'garden' }}>
          ← Back to Garden
        </Link>

        <span className="blog__eyebrow">{getGardenKindLabel(series)}</span>
        <h1 className="blog__title">{series.title}</h1>
        <p className="blog__intro">{series.description}</p>
        {series.link && (
          <a
            href={series.link}
            className="blog__external"
            target="_blank"
            rel="noopener noreferrer"
          >
            {series.linkLabel ?? 'Open link'}
          </a>
        )}

        {series.image && (
          <figure className="blog__hero">
            <img src={series.image} alt="" />
          </figure>
        )}

        {series.body.length > 0 && (
          <div className="blog__body">
            {series.body.map((block, index) => {
              if (typeof block === 'string') {
                return (
                  <Markdown
                    key={`body-${index}`}
                    components={{
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {block}
                  </Markdown>
                )
              }
              if (block.type === 'image') {
                return (
                  <figure key={`body-img-${index}`} className="blog__body-figure">
                    <img src={block.src} alt={block.caption ?? ''} />
                    {block.caption && <figcaption>{block.caption}</figcaption>}
                  </figure>
                )
              }
              return <p key={`body-${index}`}>{block.text}</p>
            })}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="blog__empty">No posts yet.</p>
        ) : (
          <ol className="blog__feed">
            {posts.map((post) => (
              <li key={post.slug} className="blog__feed-item">
                <time className="blog__feed-meta" dateTime={post.sortDate}>
                  {post.date}
                </time>
                <h2 className="blog__feed-title">
                  <Link to={`/garden/${series.id}/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt && <p className="blog__feed-excerpt">{post.excerpt}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  )
}
