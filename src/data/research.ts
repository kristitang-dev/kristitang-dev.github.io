import type { DetailSection } from '../components/DetailPage/DetailPage'

export interface ResearchItem {
  id: string
  title: string
  kind: 'physical' | 'analysis' | 'lab' | 'publication'
  period?: string
  sortDate: string
  description: string
  doi?: string
  contribution?: string
  /** Detail-page lead — paper/project framing when different from contribution */
  lead?: string
  tags: string[]
  status?: 'placeholder' | 'ready'
  image?: string
  /** Longer detail-page copy — expand over time */
  body: string[]
  sections?: DetailSection[]
  gallery?: string[]
  galleryTitle?: string
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
      'Developed a custom Unreal Engine pipeline generating indoor environmental and thermal datasets for HVAC and building performance research.',
    lead:
      'A Vision-to-Physics generative framework that synthesizes digital occupants with 3D spatial thermal data for indoor environments.',
    tags: ['Energy and Buildings', 'HVAC', 'Unreal Engine'],
    status: 'ready',
    image: '/images/actwear.jpg',
    body: [
      'Indoor thermal comfort depends on more than air temperature. Occupant activity (Met) and clothing insulation (Clo) shape how people experience a room — yet gathering large, well-annotated datasets that jointly capture motion, clothing, and environmental conditions is expensive and hard to scale in real buildings. Typical vision pipelines also stay in 2D, while many building-energy models still lean on a well-mixed air assumption that flattens how heat actually sits in space.',
      'This paper introduces a Vision-to-Physics (V2P) generative framework built in Unreal Engine 5. Instead of only extracting 2D labels, the pipeline synthesizes digital occupants inside a virtual chamber and pairs synchronized video with explicit 3D spatial coordinates — (x, y) for position and (z₁, z₂) for vertical stratification — alongside ASHRAE Standard 55–compliant Clo and Met ground truth. The result is a 3D spatial data architecture that maps thermal parameters to specific locations in a room, linking what cameras see to the physics buildings need to model.',
      'Together, the work offers a scalable path from visual occupant cues to physics-ready indoor data for comfort research and energy-control studies — closing a gap between computer vision outputs and building simulation inputs.',
      'My contribution focused on helping establish the Unreal Engine 5 platform and video rendering pipelines that make that virtual-to-data workflow possible.',
    ],
    sections: [
      {
        heading: 'Simulation pipeline',
        image: '/images/actwear_pipeline.jpg',
        caption:
          'Data preparation → Unreal Engine virtual chamber → synthetic video clips with ground-truth spatial data.',
      },
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
    image: '/images/timberhouse.jpg',
    body: [
      'As part of the research project at UBC’s Sustainable Built Environment Lab, I designed and built this model of a North American light-frame house. Beginning with a Revit BIM model, I translated the digital design into a fully removable physical structure used for both teaching and research.',
    ],
    sections: [
      {
        heading: 'Breakdown system',
        text: 'The model intentionally exposes insulation and layered assemblies — floor, wall, and roof — so students and visiting scholars can read how platform framing is put together: 1st-floor garage and living room, 2nd-floor bedroom / restroom / pantry, and the roof and floor systems as cutaway teaching sections.',
        image: '/images/timberhouse_breakdown.png',
        caption:
          'Annotated breakdown with intentionally exposed insulation for teaching structural and envelope design.',
      },
    ],
    gallery: ['/images/timberhousemodel.png', '/images/timberhouse_side.jpg'],
    galleryTitle: 'Project gallery',
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
