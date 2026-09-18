import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Markdown from 'react-markdown'
import { getPost } from '../content/loadPosts'
import { getGardenById } from '../data/garden'
import './Blog.css'

export function BlogPostPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>()
  const series = id ? getGardenById(id) : undefined
  const post = id && slug ? getPost(id, slug) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id, slug])

  if (!series?.blog || !post) {
    return <Navigate to={id ? `/garden/${id}` : '/'} replace />
  }

  return (
    <main className="blog">
      <article className="blog__inner">
        <Link to={`/garden/${series.id}`} className="blog__back">
          ← {series.title}
        </Link>

        <time className="blog__date" dateTime={post.sortDate}>
          {post.date}
        </time>
        <h1 className="blog__title">{post.title}</h1>

        <div className="blog__prose">
          <Markdown>{post.markdown}</Markdown>
        </div>
      </article>
    </main>
  )
}
