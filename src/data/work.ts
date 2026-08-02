import type { HistoryEra } from '../components/DetailPage/HistoryTimeline'

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
  | {
      type: 'historyTimeline'
      eras: HistoryEra[]
      hint?: string
    }

export interface WorkSection {
  heading: string
  text?: string
  paragraphs?: string[]
  image?: string
  caption?: string
  images?: { src: string; caption?: string }[]
  blocks?: WorkSectionBlock[]
  timelineSteps?: WorkTimelineStep[]
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
      'This is a VR experience where players step into three roles across time — a 1950s Kodak lab worker, a 1970s studio photographer, and the grown-up daughter from Act 2, now a face-recognition software developer. As they uncover how photography was calibrated for white skin, players witness how those biases echo into today’s AI systems, shaping who is seen, and who is not.',
    ],
    sections: [
      {
        heading: 'Do you know Shirley cards?',
        blocks: [
          {
            type: 'text',
            text: 'A standard once set history…and excluded many.',
          },
          {
            type: 'historyTimeline',
            hint: 'Select an era to see what happened/happens',
            eras: [
              {
                era: '1950s',
                title: 'The First Shirley Card',
                summary:
                  'To streamline color processing in the rise of one-hour photo labs, Kodak’s Shirley Cards became a widely adopted calibration standard.',
                details: [
                  {
                    text: 'Featuring a rotating cast of white female models all called “Shirley,” the cards helped define “normal” skin tone as light and white.',
                    image: '/images/lens-bias-shirley-1950s.jpg',
                    caption:
                      'Shirley Card examples — “normal” calibration centered on light skin.',
                  },
                  {
                    text: 'As Prof. Lorna Roth notes, buyers of cameras in the ’50s were mostly Caucasian — so the market rarely saw a need to expand across a broader range of skin tones.',
                    citation: {
                      href: 'https://www.researchgate.net/publication/279499369_Looking_at_Shirley_the_Ultimate_Norm_Colour_Balance_Image_Technologies_and_Cognitive_Equity',
                      label: 'Roth, Looking at Shirley →',
                    },
                  },
                ],
              },
              {
                era: '1970s',
                title: 'Commercial pressure emerges',
                summary:
                  'Kodak was called out by furniture and chocolate companies for film that failed to capture accurate colors and details in dark tones — “milk chocolate vs. dark chocolate,” “where are the wood grains?”',
                details: [
                  {
                    text: 'Market pressure pushed Kodak to start reformulating film. Improvements arrived, but they were still incomplete for the full range of skin tones people needed to see.',
                    image: '/images/details/through/1970s.png',
                  },
                ],
              },
              {
                era: '1990s',
                title: 'Multiracial Shirley Cards',
                summary:
                  'Kodak introduced new calibration cards featuring three women — Caucasian, Asian, and African — forming the first official multiracial Shirley Card.',
                details: [
                  {
                    text:'',
                    image:'/images/details/through/1990s.png',
                  },
                ],
              },
              {
                era: '2000s',
                title: 'Inherited defaults',
                summary:
                  'Digital auto-calibrations inherit legacy biases from film-era color systems. Moving off film did not erase the assumptions baked into “correct” exposure and color balance.',
                details: [
                  {
                    text:'',
                    image:'/images/details/through/digital.png',
                  },
                ],              
              },
              {
                era: 'Today',
                title: 'Enduring legacy in digital & AI',
                highlight: true,
                summary:
                  'Face-tracking, recognition, and generative systems still show higher error rates for darker-skinned people — or overcorrect into a sanitized “safe” default that flattens individuality.',
                details: [
                  'To avoid risk and controversy, some AI systems ignore user instructions and overly sanitize outputs. Even when asked to replicate an image exactly, a model may gradually alter it — prioritizing “neutral” safety over accuracy and diversity.',
                ],
                cases: [
                  {
                    title: 'HP face-tracking webcams',
                    text: 'Viral demos showed webcams tracking lighter faces while failing to lock onto darker-skinned people beside them.',
                    image: '/images/details/through/HPcam.png',
                    caption:
                      'Virtual background / face tools failing on darker skin while tracking lighter faces.',
                    citation: {
                      href: 'https://gizmodo.com/hp-face-tracking-webcams-dont-recognize-black-people-5431190',
                      label: 'Gizmodo →',
                    },
                  },
                  {
                    title: '“White default” generative bias',
                    text: 'Image systems have defaulted toward lighter-skinned outputs and mishandled prompts involving darker skin.',
                    image: '/images/details/through/blackwoman.png',
                  },
                  {
                    title:'AI Overcorrection',
                    text: 'To avoid risk and controversy, nowadays AI systems often overcorrect—ignoring user instructions and overly sanitizing outputs. Even when asked to replicate an image exactly, the model may gradually alter it, prioritizing safety over accuracy. This leads to a loss of individuality and diversity, as AI defaults to what it sees as “neutral” or “safe.”',
                    image: '/images/details/through/overcorrection.png',
                    citation: {
                      href: 'https://www.youtube.com/watch?v=Hx8N8y_wJds&t=12s',
                      label: 'Youtube →',
                    },
                  },
                ],
              },
            ],
          },
          {
            type: 'text',
            text: 'From Shirley Cards that defined “normal” skin as white to datasets built on those same assumptions, the way we capture and process faces has never been neutral. As technology tries to “fix” the past, it sometimes introduces new discomfort. Is that progress — or another kind of bias?',
          },
        ],
      },
      {
        heading: 'Ideation',
        text: 'The experience is designed as VR first-person with hands interaction and narrative storytelling — avoiding HUD overlays where possible so attention stays in the camera and the scene. Themes span racial bias in analog and digital systems, visibility and invisibility, technological inheritance, memory and loss, and design as a form of power. Three acts carry the player from a 1950s Kodak lab, through a 1970s photo studio, into today’s AI training lab.',
        image: '/images/lens-bias-ideation.png',
        caption:
          'Concept board: three acts, camera mechanics, and player roles across time.',
      },
      {
        heading: 'Narrative & storyboard',
        text: 'Act 1 places you as a Kodak lab technician with a twin-lens reflex camera — Shirley looks “perfect.” Act 2 puts a Polaroid OneStep in your hands at a family studio session; something feels off when darker skin fails to render. Act 3 returns years later as the daughter, now an AI engineer, confronting recognition systems that still struggle — and asking what repair means inside biased infrastructure.',
        image: '/images/lens-bias-storyboard.png',
        caption:
          'Storyboard beats from film calibration and Polaroid failure to recognition bias and hard-won visibility.',
      },
      {
        heading: 'Three acts',
        timelineSteps: [
          {
            title: 'Act 1 — 1950s Kodak Lab',
            text: 'Play as a lab technician. Load film, adjust the TLR, photograph Shirley, hand in the camera. The system rewards a “correct” exposure calibrated to white skin.',
            image: '/images/details/through/act1.png',
          },
          {
            title: 'Act 2 — 1970s Photo Studio',
            text: 'Play as a studio photographer with a Polaroid OneStep. Instant feedback makes the emotional break immediate when a family portrait fails darker skin.',
            image: '/images/details/through/act2.png',
          },
          {
            title: 'Act 3 — Today · Training AI',
            text: 'Play as the grown-up daughter — now an AI engineer. Test, classify, re-test. Restoration tools cannot access a neutral truth; every “fix” carries assumptions.',
            image: '/images/details/through/act3.png',
          },
        ],
      },
      {
        heading: 'Emotional journey',
        text: 'Each act pairs operations with emotion: curiosity and satisfaction in the Kodak lab; frustration when Polaroids feel wrong; confusion, worry, and finally being moved as classification and re-testing surface the cost of “defaults.”',
        image: '/images/lens-bias-emotion-map.png',
        caption:
          'Operation vs. emotion across the three acts — from engaged lab work to the sting of bias and reflective repair.',
      },
      {
        heading: 'Environment & sound',
        blocks: [
          {
            type: 'text',
            text: 'Warm, low lighting in the first two acts evokes nostalgia; cold, sterile light in the final act marks emotional distance.',
          },
          {
            type: 'imageGrid',
            images: [
              {
                src: '/images/details/through/scene1.png',
                caption: 'Act 1 — warm Kodak lab light',
              },
              {
                src: '/images/details/through/scene2.png',
                caption: 'Act 2 — studio nostalgia',
              },
              {
                src: '/images/details/through/scene3.png',
                caption: 'Act 3 — cold AI lab light',
              },
            ],
          },
          {
            type: 'text',
            text: 'Classical music in the 1950s lab, radio pop in the 1970s studio, and minimal electronics in the AI lab track shifts in mood and time. Subtle film reels, shutter clicks, and digital tones deepen immersion.',
          },
          {
            type: 'imageGrid',
            images: [
              {
                src: '/images/details/through/music1.png',
              },
              {
                src: '/images/details/through/music2.png',
              },
            ],
          },
        ],
      },
      {
        heading: 'Innovative interaction',
        paragraphs: [
          'Twin-Lens Reflex (TLR): designed for waist-level use, so players look into the viewfinder without HUD interference — an uninterrupted, analog framing practice.',
          'Polaroid OneStep: marketed as “the world’s simplest camera.” Pick it up, press the right trigger, and the photo prints automatically — built for spontaneous emotional response at the peak of Act 2.',
          'In Unreal, a SceneCaptureComponent2D acts as a virtual camera for the live viewfinder and still capture. Joystick rotation is converted to degrees and passed as delta values into camera adjustment events, so exposure and framing feel physical rather than menu-driven.',
        ],
      },
    ],
    galleryTitle: 'Screenshots',
    gallery: [
      {
        src: '/images/details/through/shirly.png',
      },
      {
        src: '/images/details/through/act2result.png',
      },
      {
        src: '/images/details/through/darkroom.png',
      },
      {
        src: '/images/details/through/studio.png',
      },
      {
        src: '/images/details/through/office.png',
      },
    ],
    epilogue: {
      heading: 'Game philosophy',
      paragraphs: [
        'Exposure serves as a metaphor for whose realities systems center. In Act I, adjusting exposure feels like technical optimization. In Act II, the same parameters reveal privilege — achieving visibility for one body can render another illegible. “Correct” exposure is always calibrated to someone, and that calibration determines who disappears.',
        'Focus works the same way. Compositional emphasis becomes structural attention: what do systems center, and what do they push into blur? Focus is not neutral framing — it is an epistemological decision about whose presence matters.',
        'Restoration in Act III literalizes repair inside biased systems. Computational tools cannot retrieve a neutral truth; every restoration choice perpetuates particular assumptions. Fixing discriminatory outcomes takes more than technical adjustment — it demands interrogating the infrastructures that produced them.',
      ],
    },
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
