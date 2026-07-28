export type WorkCategory = 'critical' | 'vr-mr' | 'assistive' | 'all'

export type WorkCategoryId = Exclude<WorkCategory, 'all'>

export const workCategoryLabels: Record<WorkCategoryId, string> = {
  critical: 'Critical & Experimental',
  'vr-mr': 'VR / MR',
  assistive: 'Assistive Tech',
}

export interface WorkItem {
  id: string
  title: string
  subtitle: string
  /** One or more categories — used for filters and card badges */
  categories: WorkCategoryId[]
  period: string
  sortDate: string
  type: string
  description: string
  tags: string[]
  tools: string[]
  image: string
  link?: string
  featured?: boolean
  /** Longer detail-page copy — expand over time */
  body: string[]
  gallery?: string[]
}

export function getCategoryLabels(item: WorkItem): string[] {
  return item.categories.map((id) => workCategoryLabels[id])
}

export const workItems: WorkItem[] = [
  {
    id: 'graintwin',
    title: 'GrainTwin',
    subtitle: 'MR Platform with Smart PPE for Collaborative Woodworking',
    categories: ['vr-mr','assistive'],
    period: 'Jul 2025 – Oct 2025',
    sortDate: '2025-10',
    type: 'Group Project · Role: Concept & Interface Design, User Testing',
    description:
      'A mixed reality platform that brings real-time awareness and collaborative decision-making to small woodworking enterprises — pairing smart PPE with digital twin scenarios to bridge craft and computation.',
    tags: ['Human–Machine Interaction', 'Smart Manufacturing', 'Mixed Reality'],
    tools: ['Figma', 'Unity', 'Apple Vision Pro'],
    image: '/images/graintwin.jpg',
    featured: true,
    body: [
      'Placeholder — detail page for GrainTwin. Add process, role breakdown, system diagrams, and outcomes here.',
      'This page will eventually cover research motivation, MR interface design, usability testing, and collaboration with the team.',
    ],
  },
  {
    id: 'lens-of-bias',
    title: 'Through the Lens of Bias',
    subtitle: 'VR Storytelling Experience',
    categories: ['vr-mr', 'critical'],
    period: 'Feb 2025 – July 2025',
    sortDate: '2025-07',
    type: 'Independent Project',
    description:
      'A VR narrative that traces how photographic “defaults” — from Shirley Cards to digital auto-calibration — encode racial bias into vision systems. You cannot change history in this game, but you can feel its weight.',
    tags: ['VR Narrative', 'Social Bias Research', 'Photography Technology'],
    tools: ['Unreal Engine', 'Blender', 'Meta'],
    image: '/images/lens-of-bias.jpg',
    featured: true,
    body: [
      'Placeholder — detail page for Through the Lens of Bias. Add research background, narrative structure, and VR interaction design here.',
      'Expand with Shirley Card history, playthrough notes, and technical pipeline (Unreal / Meta).',
    ],
  },
  {
    id: 'somo',
    title: 'SoMo',
    subtitle: 'Assistive Device & Companion App',
    categories: ['assistive'],
    period: 'Mar 2025 – May 2025',
    sortDate: '2025-05',
    type: 'Independent Project',
    description:
      'Social + Emotion = SoMo. A wearable ear clip and companion app that provides real-time social-emotional feedback for people who struggle to “read the air” — subtle, smart, and supportive.',
    tags: ['Affective Computing', 'Emotional Intelligence', 'Wearable'],
    tools: ['Figma', 'Arduino', 'Fusion 360', 'Python'],
    image: '/images/somo.jpg',
    featured: true,
    body: [
      'Placeholder — detail page for SoMo. Add problem framing, hardware design, app flows, and testing notes here.',
      'Expand with form studies, sensor logic, and companion-app UI.',
    ],
  },
  {
    id: 'nutrisynth',
    title: 'NutriSynth',
    subtitle: 'LLM-Based AI Native Sci-Fi Speculative Game',
    categories: ['critical'],
    period: 'Nov 2024 – Feb 2025',
    sortDate: '2025-02',
    type: 'Independent Project',
    description:
      'When synthetic perfection reigns, can a simple drink made with care bring back the heart of humanity? An LLM-driven speculative game exploring what we lose when convenience replaces tradition — from street stalls to synthetic futures.',
    tags: ['AI × Interaction', 'Speculative Game', 'Futuristic Game'],
    tools: ['Unity', 'OpenAI', 'ElevenLabs'],
    image: '/images/nutrisynth.jpg',
    featured: true,
    body: [
      'Placeholder — detail page for NutriSynth. Add world-building, LLM dialogue system, and craft mechanics here.',
      'Expand with storyboards, ingredient systems, and playable demo links.',
    ],
  },
]

export const workFilters: { id: WorkCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vr-mr', label: 'VR / MR' },
  { id: 'critical', label: 'Critical' },
  { id: 'assistive', label: 'Assistive' },
]

export function getWorkById(id: string) {
  return workItems.find((item) => item.id === id)
}
