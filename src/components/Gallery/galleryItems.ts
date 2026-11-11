import { sandboxEntries } from '../../data/sandbox'
import { workItems, type WorkCategoryId } from '../../data/work'
import { getPost } from '../../content/loadPosts'

export type GalleryCard = {
  id: string
  title: string
  description: string
  tags: string[]
  image?: string
  preview?: string
  to: string
  /** Work filters. Pieces without a category stay in All. */
  categories?: WorkCategoryId[]
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

const heroGallery: Record<string, string> = {
  nutrisynth: '/images/herogallery/LLM%20AI%20Native%20Game%20-%20NutriSynth.gif',
  'lens-of-bias': '/images/herogallery/Trimmed_Through.gif',
}

const studioPosts = ['endangered-animal', 'time-capsule']
  .map((slug) => getPost('ideation-prototyping', slug))
  .filter((post) => post != null)

export const galleryCards: GalleryCard[] = [
  ...workItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    image: heroGallery[item.id] ?? item.detailImage ?? item.image,
    categories: item.categories,
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
    tags:
      post.slug === 'time-capsule'
        ? ['Form', 'Material', 'Three.js']
        : post.slug === 'endangered-animal'
          ? ['Form', 'Material']
          : ['Ideation & Prototyping'],
    image:
      post.slug === 'time-capsule'
        ? '/images/herogallery/Misinterpretation.gif'
        : post.slug === 'endangered-animal'
          ? '/images/herogallery/endangered_animal.gif'
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
