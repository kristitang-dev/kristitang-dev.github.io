import { useEffect } from 'react'

interface ExternalRedirectProps {
  url: string
}

export function ExternalRedirect({ url }: ExternalRedirectProps) {
  useEffect(() => {
    window.location.replace(url)
  }, [url])

  return (
    <main className="blog">
      <div className="blog__inner">
        <p className="blog__intro">
          Opening{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          …
        </p>
      </div>
    </main>
  )
}
