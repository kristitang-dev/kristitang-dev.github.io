interface ExternalRedirectProps {
  url: string
}

/** Keep this page in place and send the outside link to a new tab. */
export function ExternalRedirect({ url }: ExternalRedirectProps) {
  return (
    <main className="blog">
      <div className="blog__inner">
        <p className="blog__intro">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Open in a new tab
          </a>
        </p>
      </div>
    </main>
  )
}
