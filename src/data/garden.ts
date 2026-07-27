export interface GardenEntry {
  id: string
  title: string
  kind: 'photography' | 'game'
  description: string
  image?: string
  link?: string
  linkLabel?: string
  /** Longer detail-page copy — expand over time */
  body: string[]
  gallery?: string[]
}

export const gardenEntries: GardenEntry[] = [
  {
    id: 'bubblebright',
    title: 'BubbleBright. Co',
    kind: 'game',
    description:
      'Global Game Jam 2025 (theme: Bubble) — a 2-day rhythm multitasking game made with Steph. You’re a tired dispatcher at BubbleBright Co., juggling calls and intrusive thoughts while each action becomes part of the soundtrack.',
    image: '/images/bubblebright.jpg',
    link: 'https://klight7.itch.io/bubblebright-co',
    linkLabel: 'Play on itch.io',
    body: [
      'Placeholder — Game Jam detail page. Add jam constraints, role split (design/code vs audio), and postmortem notes here.',
      'Expand with gameplay screenshots, control scheme, and what you’d iterate next.',
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
      'Placeholder — City Life detail. Add more night photographs and short captions here.',
    ],
    gallery: ['/images/citylife.jpg'],
  },
  {
    id: 'breath',
    title: 'Breath',
    kind: 'photography',
    description:
      'To me, Chinese countryside always carries a quiet loneliness, a sense of being left behind by time, by progress. Even in some shared moments, that feeling still lingers.',
    image: '/images/breath.jpg',
    body: [
      'Placeholder — Breath detail. Add selected countryside frames and short captions here.',
    ],
    gallery: ['/images/breath.jpg'],
  },
  {
    id: 'gaze',
    title: 'Gaze',
    kind: 'photography',
    description:
      'A photograph is never just one gaze. \n It might be the subject looking outward, \nand me looking at them.  \nAnd sometimes, we are looking at each other. ',
    image: '/images/gaze.jpg',
    body: [
      'Placeholder — Breath detail. Add selected countryside frames and short captions here.',
    ],
    gallery: ['/images/breath.jpg'],
  },
]

export function getGardenById(id: string) {
  return gardenEntries.find((item) => item.id === id)
}
