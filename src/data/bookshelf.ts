import type { CatalogEntry } from './entry'

export const notebooks: CatalogEntry[] = [
  {
    id: 'creative-coding',
    title: 'Creative Coding is...',
    kinds: ['code'],
    description:
      'Mainly p5.js experiments for IDM Creative Coding.',
    image: '/images/creative.gif',
    link: 'https://creative-coding-dm-gy6063e-f26.github.io/cchomework-kristitang/',
    linkLabel: 'Open Digital Sketches',
    redirect: true,
    courseLabel: 'Creative Coding',
    notebookCover: '/images/creative.gif',
    body: [
      'I am taking Creative Coding at NYU Tandon IDM this fall. These are small studies, mostly in p5.js. Sketches live on a [separate GitHub Pages site](https://creative-coding-dm-gy6063e-f26.github.io/cchomework-kt/).',
    ],
  },
  {
    id: 'ideation-prototyping',
    title: 'Ideation & Prototyping',
    kinds: ['writing'],
    description:
      'Studio process for IDM Ideation & Prototyping — documented as I go.',
    image: '/images/Goldfish.jpg',
    blog: true,
    courseLabel: 'Ideation & Prototyping',
    body: [
      'It is always good to document the work :)',
    ],
  },
]

export const albums: CatalogEntry[] = [
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
