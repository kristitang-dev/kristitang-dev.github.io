export interface ResearchItem {
  id: string
  title: string
  kind: 'physical' | 'analysis' | 'lab' | 'publication'
  period?: string
  sortDate: string
  description: string
  doi?: string
  contribution?: string
  tags: string[]
  status?: 'placeholder' | 'ready'
  image?: string
  /** Longer detail-page copy — expand over time */
  body: string[]
  gallery?: string[]
}

export const researchItems: ResearchItem[] = [
  {
    id: 'vision-to-physics-paper',
    title:
      'From vision to physics: Generative occupant modeling and 3D spatial data architecture in indoor environments',
    kind: 'publication',
    period: '2026',
    sortDate: '2026-01',
    description: 'Li, R., Tang, L., & Feng, H. (2026). Energy and Buildings, 117785.',
    doi: 'https://doi.org/10.1016/j.enbuild.2026.117785',
    contribution:
      'Developed a custom Unreal Engine simulation pipeline to generate indoor environmental scenarios and thermal data for HVAC control research and building energy performance studies.',
    tags: ['Energy and Buildings', 'HVAC', 'Unreal Engine'],
    status: 'ready',
    image: '/images/actwear.jpg',
    body: [
      'Placeholder — publication detail page. Add abstract, method overview, figures, and how this connects to ongoing ActWear / occupant-modeling research.',
      'Your Unreal Engine pipeline contribution can be expanded here with diagrams and scenario examples.',
    ],
  },
  {
    id: 'platform-framing',
    title: '1:10 Scale Platform Framing Models',
    kind: 'physical',
    period: 'May – Aug 2025',
    sortDate: '2025-08',
    description:
      'Physical scale models exploring platform framing systems — translating structural logic into tangible form at ten-to-one.',
    tags: ['Physical Model', 'Structural Systems', 'Wood Construction'],
    status: 'ready',
    image: '/images/timberhouse.png',
    body: [
      'Placeholder — detail page for the 1:10 platform framing models. Add process photos, joinery notes, and structural learnings here.',
      'Expand with construction sequence and material decisions.',
    ],
    gallery: ['/images/timberhouse_breakdown.png'],
  },
]

export const researchKindLabels: Record<ResearchItem['kind'], string> = {
  physical: 'Physical',
  analysis: 'Analysis',
  lab: 'Lab / TA',
  publication: 'Publication',
}

export function getResearchById(id: string) {
  return researchItems.find((item) => item.id === id)
}
