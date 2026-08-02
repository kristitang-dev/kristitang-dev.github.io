import type {
  DetailGalleryBlock,
  DetailGalleryLayout,
} from '../components/DetailPage/DetailPage'

export interface GardenEntry {
  id: string
  title: string
  kind: 'photography' | 'game' | 'video'
  description: string
  image?: string
  link?: string
  linkLabel?: string
  /** Longer detail-page copy — expand over time */
  body: Array<string | { type: 'image'; src: string; caption?: string }>
  /** Simple single gallery (games scroll strip, etc.) */
  gallery?: string[]
  galleryTitle?: string
  galleryLayout?: DetailGalleryLayout
  /**
   * Mix layouts on one detail page, e.g. 2x1 then 1x1 then 3x1.
   * Prefer this for photography series.
   */
  galleryBlocks?: DetailGalleryBlock[]
}

export const gardenEntries: GardenEntry[] = [
  {
    id: 'bubblebright',
    title: 'BubbleBright. Co',
    kind: 'game',
    description:
      'Global Game Jam 2025 (theme: Bubble) — a 2-day rhythm multitasking game.',
    image: '/images/bubblebright.jpg',
    link: 'https://klight7.itch.io/bubblebright-co',
    linkLabel: 'Play on itch.io',
    body: [
      '"You’re a tired dispatcher at BubbleBright Co., juggling calls and intrusive thoughts while each action becomes part of the soundtrack."',
      'I teamed up with my friend Steph, a Nintendo fan and music maker, for a game jam themed “Bubble.” In 2 days, we built a rhythm-based multitasking game set in BubbleBright Co., where the player is a tired dispatcher juggling calls and intrusive thoughts. Using Space to pick up, 1–4 to transfer, and typing “OUT” to clear negativity, each action triggers a sound. With Steph’s demo track in the background, players create music as they play.',
      {
        type: 'image',
        src: '/images/details/bubble/contribution.png',
      },
    ],
    gallery: [
      '/images/details/bubble/Settlement3.png',
      '/images/details/bubble/Settlement1.png',
      '/images/details/bubble/Settlement2.png',
    ],
  },
  {
    id: 'city-life',
    title: 'City Life',
    kind: 'photography',
    description:
      'When the word ‘city’ was first imagined, no one pictured chaos — the neon lights, the noise, the haze of light and air pollution. Yet that is what a city becomes.',
    image: '/images/citylife.jpg',
    body: [
      'City life is a constant pulse of vitality — full of new opportunities, triumphs, failures, regrets, and that lingering restlessness that keeps us moving. Everyone rushes through their days, chasing moments of pride and disappointment, gain and loss — the endless rhythm of being alive in a place that never truly sleeps.',
    ],
  },
  {
    id: 'gaze',
    title: 'Gaze',
    kind: 'photography',
    description:
      'A photograph is never just one gaze.\nIt might be the subject looking outward,\nand me looking at them.\nAnd sometimes, we are looking at each other.',
    image: '/images/gaze.jpg',
    body: [
      'The relationship between photographer and subject shapes everything the camera captures.',
    ],
    // Example: mix a 2-up row, then one large photo alone
    galleryBlocks: [
      {
        layout: '2x1',
        images: [
          '/images/garden/gaze/child1.jpg',
          '/images/garden/gaze/child2.jpg',
        ],
      },
      {
        layout: '1x1',
        images: ['/images/garden/gaze/fire.jpg'],
      },
      {
        layout: '2x1',
        images: [
          '/images/garden/gaze/beijing.jpg',
          '/images/garden/gaze/boatman.jpg',
        ],
      },
      {
        layout: '1x1',
        images: ['/images/mother.jpg'],
      },
    ],
  },
  {
    id: 'breath',
    title: 'Breath',
    kind: 'photography',
    description: '...Even in some shared moments, that feeling still lingers...',
    image: '/images/breath.jpg',
    body: [
      'These photos were mainly taken in rural China. To me, the countryside always carries a quiet loneliness, a sense of being left behind by time, by progress. Even in some shared moments, that feeling still lingers. Yet within that stillness, I found something pure, a kind of joy that costs nothing and needs nothing beyond the moment itself.',
    ],
  },
]

export function getGardenById(id: string) {
  return gardenEntries.find((item) => item.id === id)
}
