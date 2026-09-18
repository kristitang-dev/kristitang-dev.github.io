export interface BlogPost {
  series: string
  slug: string
  title: string
  date: string
  sortDate: string
  excerpt?: string
  markdown: string
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { meta: {} as Record<string, string>, markdown: raw.trim() }
  }

  const meta: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const cut = line.indexOf(':')
    if (cut === -1) continue
    const key = line.slice(0, cut).trim()
    const value = line.slice(cut + 1).trim()
    meta[key] = value
  }

  return { meta, markdown: match[2].trim() }
}

function formatDate(iso: string) {
  const parsed = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const files = import.meta.glob('./**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const blogPosts: BlogPost[] = Object.entries(files).map(([path, raw]) => {
  const match = path.replace(/\\/g, '/').match(/([^/]+)\/([^/]+)\.md$/)
  const series = match?.[1] ?? 'writing'
  const slug = match?.[2] ?? 'post'
  const { meta, markdown } = parseFrontmatter(raw)
  const sortDate = meta.date ?? '1970-01-01'

  return {
    series,
    slug,
    title: meta.title ?? slug,
    date: formatDate(sortDate),
    sortDate,
    excerpt: meta.excerpt,
    markdown,
  }
})

export function getPostsBySeries(series: string) {
  return blogPosts
    .filter((post) => post.series === series)
    .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
}

export function getPost(series: string, slug: string) {
  return blogPosts.find((post) => post.series === series && post.slug === slug)
}
