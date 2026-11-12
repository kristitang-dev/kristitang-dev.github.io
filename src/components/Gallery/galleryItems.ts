import { sandboxEntries } from '../../data/sandbox'
import { workItems, type WorkCategoryId } from '../../data/work'
import { getPost } from '../../content/loadPosts'

export type GalleryCard = {
  id: string
  title: string
  description: string
  tags: string[]
  /** Short labels under the preview. The detail card keeps `tags`. */
  previewTags?: string[]
  /** Sort Up groups. Pieces with none stay in All. */
  sorts?: string[]
  image?: string
  /** Show the whole image inside the preview instead of cropping it. */
  contain?: boolean
  /** Plays only while the card is hovered or focused. */
  motion?: string
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

const previewTags: Record<string, string[]> = {
  graintwin: ['Human–Machine Interaction', 'MR', 'Apple Vision Pro'],
  'endangered-animal': ['Material'],
  'lens-of-bias': ['VR', 'Game', 'Unreal Engine'],
  'time-capsule': ['Three.js', 'Material'],
  bubblebright: ['Game', 'Unity'],
  nutrisynth: ['AI × Interaction', 'Game'],
  somo: ['Wearable'],
  'time-space-clock': ['P5.js'],
  halftone: ['P5.js'],
}

const sortFromTag: Record<string, string> = {
  MR: 'mr-vr',
  VR: 'mr-vr',
  Game: 'game',
  Material: 'material',
  'Three.js': 'code',
  'P5.js': 'code',
}

function sortsFor(id: string) {
  const groups = (previewTags[id] ?? []).map((tag) => sortFromTag[tag]).filter((group) => group != null)
  return [...new Set(groups)]
}

export const gallerySorts: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mr-vr', label: 'MR/VR' },
  { id: 'game', label: 'Game' },
  { id: 'material', label: 'Material' },
  { id: 'code', label: 'Code' },
]

const heroGallery: Record<string, { still: string; motion: string }> = {
  nutrisynth: {
    still: '/images/NutriSynth.png',
    motion: '/images/herogallery/LLM%20AI%20Native%20Game%20-%20NutriSynth.gif',
  },
  'lens-of-bias': {
    still: '/images/lens-of-bias.jpg',
    motion: '/images/herogallery/Trimmed_Through.gif',
  },
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
    previewTags: previewTags[item.id],
    sorts: sortsFor(item.id),
    image: heroGallery[item.id]?.still ?? item.detailImage ?? item.image,
    motion: heroGallery[item.id]?.motion,
    categories: item.categories,
    to: `/work/${item.id}`,
    quiet: quiet.has(item.id),
  })),
  ...sandboxEntries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    tags: entry.kinds.map((kind) => kindLabel[kind] ?? kind),
    previewTags: previewTags[entry.id],
    sorts: sortsFor(entry.id),
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
    previewTags: previewTags[post.slug],
    sorts: sortsFor(post.slug),
    image:
      post.slug === 'time-capsule'
        ? '/images/herogallery/Misinterpretation.gif'
        : post.slug === 'endangered-animal'
          ? '/images/herogallery/endangered-animal.png'
          : post.cover,
    contain: post.slug === 'endangered-animal',
    to: `/garden/${post.series}/${post.slug}`,
  })),
]

export function getGalleryCard(id: string) {
  return galleryCards.find((card) => card.id === id)
}

export function galleryCardMatches(card: GalleryCard, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [card.title, card.description, ...card.tags, ...(card.previewTags ?? [])]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}
