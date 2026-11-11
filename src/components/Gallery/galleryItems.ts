import { sandboxEntries } from '../../data/sandbox'
import { workItems } from '../../data/work'
import { getPost } from '../../content/loadPosts'

export type GalleryCard = {
  id: string
  title: string
  description: string
  tags: string[]
  image?: string
  preview?: string
  to: string
  /** Smaller, and drifts a little more loosely than the main orbit. */
  quiet?: boolean
}

const kindLabel: Record<string, string> = {
  code: 'Code',
  game: 'Game',
  photography: 'Photography',
  video: 'Video',
  writing: 'Writing',
}

const quiet = new Set(['somo', 'bubblebright'])

const studioPosts = ['endangered-animal', 'time-capsule']
  .map((slug) => getPost('ideation-prototyping', slug))
  .filter((post) => post != null)

export const galleryCards: GalleryCard[] = [
  ...workItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    image: item.detailImage ?? item.image,
    to: `/work/${item.id}`,
    quiet: quiet.has(item.id),
  })),
  ...sandboxEntries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    tags: entry.kinds.map((kind) => kindLabel[kind] ?? kind),
    image: entry.image,
    preview: entry.image ? undefined : entry.preview,
    to: `/garden/${entry.id}`,
    quiet: quiet.has(entry.id),
  })),
  ...studioPosts.map((post) => ({
    id: post.slug,
    title: post.title,
    description: post.excerpt ?? '',
    tags: ['Ideation & Prototyping'],
    image:
      post.slug === 'endangered-animal'
        ? '/images/garden/endangered-animal/hook.jpg'
        : post.cover,
    to: `/garden/${post.series}/${post.slug}`,
  })),
]

export function getGalleryCard(id: string) {
  return galleryCards.find((card) => card.id === id)
}

export function galleryCardMatches(card: GalleryCard, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [card.title, card.description, ...card.tags].join(' ').toLowerCase()
  return haystack.includes(needle)
}
