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
      'I was responsible for designing and implementing the virtual simulation and interaction pipeline within ActWear.\nMy work focused on how human activity level (Met) and clothing insulation (Clo) are represented, coupled, and explored within a real-time virtual environment.',
      'So I developed the overall Unreal Engine-based pipeline, enabling a virtual-to-data workflow for studying how activity and clothing jointly shape indoor thermal comfort and building energy control',
    ],
    gallery: ['/images/actwear_pipeline.jpg'],
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
    image: '/images/timberhouse.jpg',
    body: [
      'As part of the research project at UBC’s Sustainable Built Environment Lab, I designed and built this model of a North American light-frame house.',
      'Beginning with a Revit BIM model, I translated the digital design into a fully removable physical structure used for both teaching and research.'],
    gallery: ['/images/timberhousemodel.png','/images/timberhouse_side.jpg','/images/timberhouse_breakdown.png'],
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
