import type {
  DetailGalleryBlock,
  DetailGalleryLayout,
} from '../components/DetailPage/DetailPage'

export type GardenKind = 'photography' | 'game' | 'video' | 'code' | 'writing'

export interface GardenEntry {
  id: string
  title: string
  kinds: GardenKind[]
  description: string
  image?: string
  link?: string
  linkLabel?: string
  /** Longer detail-page copy — expand over time */
  body: Array<
    | string
    | { type: 'image'; src: string; caption?: string }
    | {
        type: 'split'
        text: string
        image: string
        caption?: string
        layout?: 'text-image' | 'image-text'
      }
  >
  /** Simple single gallery (games scroll strip, etc.) */
  gallery?: string[]
  galleryTitle?: string
  galleryLayout?: DetailGalleryLayout
  /**
   * Mix layouts on one detail page, e.g. 2x1 then 1x1 then 3x1.
   * Prefer this for photography series.
   */
  galleryBlocks?: DetailGalleryBlock[]
  /** Dated markdown posts in src/content/<id>/ */
  blog?: boolean
}

export const gardenEntries: GardenEntry[] = [
  {
    id: 'ideation-prototyping',
    title: 'Ideation & Prototyping',
    kinds: ['writing'],
    description:
      'Studio process for IDM Ideation & Prototyping — documented as I go.',
    image: '/images/Goldfish.jpg',
    blog: true,
    body: [
      'It is always good to document the work :)'
    ],
  },
  {
    id: 'creative-coding',
    title: 'Creative Coding is...',
    kinds: ['writing', 'code'],
    description:
      'Notes and p5.js experiments for IDM Creative Coding.',
    image: '/images/creative.png',
    link: 'https://creative-coding-dm-gy6063e-f26.github.io/cchomework-kt/',
    linkLabel: 'Open Digital Sketches',
    blog: true,
    body: [
      'I am taking Creative Coding at NYU Tandon IDM this fall. These are small studies, mostly in p5.js. Sketches live on a [separate GitHub Pages site](https://creative-coding-dm-gy6063e-f26.github.io/cchomework-kt/).',
    ],
  },
  {
    id: 'bubblebright',
    title: 'BubbleBright. Co',
    kinds: ['game'],
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
    kinds: ['photography'],
    description:
      'When the word ‘city’ was first imagined, no one pictured chaos — the neon lights, the noise, the haze of light and air pollution. Yet that is what a city becomes.',
    image: '/images/citylife.jpg',
    body: [
      {
        type: 'split',
        layout: 'text-image',
        text: 'City life is a constant pulse of vitality — full of new opportunities, triumphs, failures, regrets, and that lingering restlessness that keeps us moving. Everyone rushes through their days, chasing moments of pride and disappointment, gain and loss — the endless rhythm of being alive in a place that never truly sleeps.',
        image: '/images/garden/city/neon.jpg',
      },
    ],
    galleryBlocks: [
      {
        layout: '3x1',
        images: [
          '/images/garden/city/slow.png',
          '/images/garden/city/red.jpg',
        ],
      },
      {
        layout: '1x1',
        images: ['/images/garden/city/walk.jpg'],
      },
      {
        layout: '3x1',
        images: [
          '',
          '/images/garden/city/jellyfish.png',
          '/images/garden/city/jellyfish2.jpg',
        ],
      },
      {
        layout: '1x1',
        images: ['/images/garden/city/hongkong.jpg'],
      },
    ],
  },
  {
    id: 'gaze',
    title: 'Gaze',
    kinds: ['photography'],
    description:
      'A photograph is never just one gaze.\nIt might be the subject looking outward,\nand me looking at them.\nAnd sometimes, we are looking at each other.',
    image: '/images/gaze.jpg',
    body: [
      'The relationship between photographer and subject shapes everything the camera captures.',
    ],
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
    id: 'chongqing-2023ss',
    title: 'Chongqing 2023SS',
    kinds: ['video'],
    description: 'Videography practice 01',
    image: '/images/Chongqing.jpg',
    link: 'https://www.instagram.com/reel/Dctps1qRFpW/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==',
    linkLabel: 'Watch on Instagram',
    body: [],
  },
  {
    id: 'breath',
    title: 'Breath',
    kinds: ['photography'],
    description: '...Even in some shared moments, that feeling still lingers...',
    image: '/images/breath.jpg',
    body: [
      'These photos were mainly taken in rural China.',
      'To me, the countryside always carries a quiet loneliness, a sense of being left behind by time, by progress.',
      'Even in some shared moments, that feeling still lingers. Yet within that stillness, I found something pure, a kind of joy that costs nothing and needs nothing beyond the moment itself.',
    ],
    galleryBlocks: [
      {
        layout: '3x1',
        images: [
          '/images/garden/breath/cow.jpg',
          '/images/garden/breath/chicken.jpg',
          '/images/garden/breath/field.png',
        ],
      },
      {
        layout: '3x1',
        images: [
          '/images/garden/breath/running.png',
          '/images/garden/breath/zhi.png',
          '',
        ],
      },
      {
        layout: '3x1',
        images: [
          '/images/garden/breath/laugh.jpg',
          '/images/garden/breath/watermelon.png',
          '/images/garden/breath/TVwatch.jpg',
        ],
      },
      {
        layout: '3x1',
        images: [
          '',
          '/images/garden/breath/fog.jpg',
          '/images/garden/breath/beers.jpg',
        ],
      },
      {
        layout: '1x1',
        images: ['/images/garden/breath/melody.jpg'],
      },
    ],
  },
]

export function getGardenById(id: string) {
  return gardenEntries.find((item) => item.id === id)
}

export function getGardenKindLabel(item: GardenEntry) {
  return item.kinds.join(' · ')
}
