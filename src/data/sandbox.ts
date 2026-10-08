import type { CatalogEntry } from './entry'

/** Experiments shown in the Sandbox. Add a new object here to put it on that shelf. */
export const sandboxEntries: CatalogEntry[] = [
  {
    id: 'halftone',
    title: 'Halftone Camera',
    kinds: ['code'],
    description:
      'A p5.js camera sketch — halftone, with a little moiré effect.',
    image: '/images/halftone.jpg',
    link: 'https://creative-coding-dm-gy6063e-f26.github.io/cchomework-kristitang/halftone-camera/HalftoneCamera.html',
    linkLabel: 'Open the p5 camera sketch',
    detailLinkLabel: 'Try out the halftone camera to create your own image!',
    linkIcon: '/images/halftone/camera.png',
    body: [
      'In Creative Coding this fall, I started with a pen plotter and a sheet of transparent film.',
      {
        type: 'images',
        images: [
          {
            src: '/images/halftone/TransparentPlotting.gif',
          },
          {
            src: '/images/halftone/FirstTry.jpeg',
          },
        ],
      },
      'Somehow, I saw a face showed up in that first drawing. So I thought maybe I could try to draw a human face using the same pattern. Just like the halftone dots.',
      'And I picked Mona Lisa.',
      'When plotting, I made them into two layers, which made that moiré easier to see.',
      {
        type: 'image',
        src: '/images/halftone/MonaLisaMorie.gif',
        scale: 0.5,
      },
      'And if it could turn Mona Lisa into dots, it could turn anything. That’s the how the halftone camera came.',
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
        scale: 0.5,
      },
    ],
    gallery: [
      '/images/details/bubble/Settlement3.png',
      '/images/details/bubble/Settlement1.png',
      '/images/details/bubble/Settlement2.png',
    ],
  },
]
