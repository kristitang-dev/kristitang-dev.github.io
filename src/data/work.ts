export type WorkCategory = 'critical' | 'vr-mr' | 'assistive' | 'all'

export type WorkCategoryId = Exclude<WorkCategory, 'all'>

export const workCategoryLabels: Record<WorkCategoryId, string> = {
  critical: 'Critical & Experimental',
  'vr-mr': 'VR / MR',
  assistive: 'Assistive Tech',
}

export type WorkSectionBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'code'; code: string; label?: string }
  | {
      type: 'imageGrid'
      images: { src: string; caption?: string }[]
    }

export interface WorkSection {
  heading: string
  text?: string
  paragraphs?: string[]
  image?: string
  caption?: string
  images?: { src: string; caption?: string }[]
  blocks?: WorkSectionBlock[]
}

export interface WorkTimelineStep {
  title: string
  text: string
  image?: string
  caption?: string
  loop?: boolean
}

export interface WorkGalleryItem {
  src: string
  caption?: string
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
  linkLabel?: string
  featured?: boolean
  /** Opening paragraphs on the detail page */
  body: string[]
  /** Paired text + image blocks */
  sections?: WorkSection[]
  /** Ordered steps for project / game logic */
  timeline?: WorkTimelineStep[]
  timelineTitle?: string
  gallery?: WorkGalleryItem[] | string[]
  galleryTitle?: string
  /** Closing note at the end of the detail page */
  epilogue?: {
    heading: string
    paragraphs: string[]
    image?: string
  }
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
      'When synthetic perfection reigns, can a simple drink made with care bring back the heart of humanity?',
    tags: ['AI × Interaction', 'Speculative Game', 'Futuristic Game'],
    tools: ['Unity', 'OpenAI', 'C#', 'ElevenLabs'],
    image: '/images/nutrisynth.jpg',
    link: 'https://youtu.be/ZiPtCssE_RU',
    linkLabel: 'Watch trailer',
    featured: true,
    body: [
      'What if…',
      'In that future, we don’t cook. We don’t wait. We don’t need coffee to stay awake or tea to relax. Every nutrient, every flavor, every feeling is delivered instantly through a single, all-in-one product. No effort. No waste. No time lost.',
      'In NutriSynth, that future is now. Such a product exists. Would you choose to use it?',
      'NutriSynth is a speculative game about our pursuit of perfect efficiency—and the quiet loss that follows when convenience replaces culture, when food becomes data, when eating loses its meaning, and when we forget how to slow down.',
    ],
    sections: [
      {
        heading: 'Inspiration',
        text: 'The project grew from two places: memories of roadside vendors and night markets in China, and sci-fi images of synthetic protein futures. I wanted to ask whether small, human acts of making — a drink mixed with attention — can still matter when systems optimize everything else away.',
        image: '/images/nutrisynth-brainstorm.png',
        caption:
          'Early brainstorm: food-truck ritual vs. synthetic nutrition as a cultural fault line.',
      },
      {
        heading: 'World & story',
        text: 'You run a food truck of handcrafted drinks in a near-future where NutriSynth — a synthetic all-in-one nutrition product — promises efficiency and perfection. Society splits between those who embrace it and those who cling to traditional food culture. Every cup becomes a small story about care, trust, and what we lose when convenience replaces ritual. The fiction asks what “care” looks like when a single product can already meet every nutritional need — and whether staying with natural ingredients is resistance, nostalgia, or simply another way of valuing time and taste.',
        images: [
          {
            src: '/images/nutrisynth-world-city.png',
            caption: 'The near-future city where NutriSynth billboards and flying traffic set the tone.',
          },
          {
            src: '/images/nutrisynth-world-truck.png',
            caption: 'Flavour Van — the handcrafted drink truck at the center of the story.',
          },
          {
            src: '/images/nutrisynth_world.png',
            caption:
              'Level layout of the food-truck world: synthetic perfection on one side, handmade ritual on the other.',
          },
        ],
      },
      {
        heading: 'Game mechanics',
        text: 'Gameplay rests on three pillars: dynamic dialogue to learn each customer’s tastes and temperament; crafting blends from 18 ingredients with costs, effects, and allergens; and resource management that keeps every choice consequential. Customers ask for Energy, Comfort, Focus, or Mood Uplift — you pick three materials (repeats allowed), score against their need, and watch reactions unfold.',
        image: '/images/nutrisynth-mechanics.png',
        caption:
          'Core loop diagram: talk to learn preferences, craft a three-ingredient blend, then read the reaction.',
      },
      {
        heading: 'AI-native stack — NPC as the levels',
        blocks: [
          {
            type: 'text',
            text: 'Instead of map levels, customers are the levels. Each NPC is seeded with mood, preferences, dialogue style, allergy, NutriSynth attitude, and a hidden need — then sent to ChatGPT-4o through a customer-profile prompt so they never state the need directly. Whisper handles spoken input; ElevenLabs voices replies in real time; a SystemGPT layer decides when the player has learned enough to unlock blending.',
          },
          {
            type: 'image',
            src: '/images/nutrisynth_allcharacters.png',
            caption: 'Cast of customer NPCs — each one is a seeded level.',
          },
          {
            type: 'text',
            text: 'Customer prompt engineering builds that persona at runtime: name, age, gender, occupation, mood, style, interest, allergy, attitude toward NutriSynth, and the need the player must discover through conversation. The prompt is the level design — different seeds, different social puzzles.',
          },
          {
            type: 'code',
            label: 'Customer profile prompt',
            code: `$"You are {customerName}, a {age}-year-old {gender} {occupation} living in a near-future city.\\n" +
$"You seem {mood} and your behavior reflects a {style} style.\\n" +
$"You are interested in {interest} but are allergic to {allergy}.\\n" +
$"You are {attitude} about NutriSynth—a synthetic product that fulfills daily nutrition needs.\\n" +
$"You may need {need} from the retailer's blend, but you won't state it directly.\\n" +`,
          },
          {
            type: 'text',
            text: 'On the Unity side, C# scripts and built-in tools run the customer loop. CustomerManager.cs activates the next customer. CustomerProfile.cs holds the seeded data that fills the prompt; CustomerController.cs drives presence through Animator and Behavior Graph so talk, wait, react, and leave feel continuous inside the truck scene.',
          },
          {
            type: 'imageGrid',
            images: [
              {
                src: '/images/nutrisynth-behavior-graph.png',
                caption: 'Behavior Graph — customer talk / wait / leave flow',
              },
              {
                src: '/images/nutrisynth-animator-graph.png',
                caption: 'Animator — greeting, talk, drink, and reaction states',
              },
            ],
          },
        ],
      },
    ],
    timelineTitle: 'Player loop',
    timeline: [
      {
        title: 'Meet Patrick',
        text: 'Day one is a guided conversation with Patrick, who teaches the truck, the stakes of NutriSynth, and how care shows up in a drink.',
        image: '/images/nutrisynth-loop-patrick.gif',
        caption: 'Tutorial dialogue with Patrick at the food truck.',
      },
      {
        title: 'Talk & listen',
        text: 'Speak or type with each customer. Whisper and GPT-4o surface mood, preferences, allergens, and what kind of uplift they want.',
        image: '/images/nutrisynth-loop-dialogue.gif',
        caption: 'Live customer dialogue — talk until you understand the need.',
        loop: true,
      },
      {
        title: 'Unlock crafting',
        text: 'SystemGPT watches the dialogue and opens the blender only when you know enough — customers are levels, not maps.',
        image: '/images/nutrisynth-loop-menu.gif',
        caption: 'Crafting unlocks once the system decides you have learned enough.',
        loop: true,
      },
      {
        title: 'Blend three materials',
        text: 'Choose three ingredients (repeats allowed) from eighteen options. Cost, effect, and allergy rules make every cup a trade-off.',
        image: '/images/nutrisynth-loop-blend.gif',
        caption: 'Three-material blend against the customer’s requested need.',
        loop: true,
      },
      {
        title: 'Score & react',
        text: 'The blend is scored against the customer’s need. Voice and behavior shift — satisfaction, doubt, or quiet disappointment.',
        image: '/images/nutrisynth-loop-react.gif',
        caption: 'Customer reaction after the drink is scored and served.',
        loop: true,
      },
      {
        title: 'Settle an ending',
        text: 'Lean on NutriSynth shortcuts and drift toward Future Taster; keep handcrafting and hold the Traditionalist path.',
        image: '/images/nutrisynth-settlements.png',
        caption: 'Story fork toward Future Taster or Traditionalist.',
      },
    ],
    galleryTitle: 'Screenshots',
    gallery: [
      {
        src: '/images/nutrisynth_futuristicvibe.PNG',
        caption: 'Futuristic vibe',
      },
      {
        src: '/images/NutriSynth/worldSettings.png',
        caption: 'World atmosphere',
      },
      {
        src: '/images/nutrisynth-shot-greeting.gif',
        caption: 'NPC interaction',
      },

      {
        src: '/images/nutrisynth-shot-ui.gif',
        caption: 'UI feedback',
      },
      {
        src: '/images/nutrisynth-playtest.jpg',
        caption: 'Playtest session_1',
      },
      {
        src: '/images/nutrisynth-shot-playtest2.jpg',
        caption: 'Playtest session_2',
      },

    ],
    epilogue: {
      heading: 'Gameplay philosophy',
      paragraphs: [
        'It plays like a quiet social experiment rather than a traditional game. The game’s settlement system doesn’t judge but reflects. It invites players to make their own choices rather than follow a set path.',
        'You can rely on synthetic products for speed and precision, or stay with natural ingredients for their warmth and imperfection. Each approach leads to a different experience. There’s no better or worse. There’s no right or wrong. It’s just different ways of valuing time, taste, and meaning.',
        'In the end, the game simply asks: when a new, more efficient option emerges, will you embrace it, resist it, or stand somewhere in between?',
      ],
    },
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
