/** Experiments shown in the Sandbox. Add a new object here to put it on that shelf. */
export const sandboxEntries = [
    {
        id: 'time-space-clock',
        title: 'Time & Space',
        kinds: ['code'],
        description: 'Built this clock on the concept of adding time as the fourth dimension.',
        preview: '/sketches/time-space-clock/index.html',
        link: '/sketches/time-space-clock/index.html',
        linkLabel: 'Open the clock',
        body: [
            'The inspiration for Space & Time stems from an exploration of the relationship between temporal scales and physical space. When I first conceptualized this clock, I realized that traditional timekeeping relies on three fundamental scalars: seconds, minutes, and hours. This naturally drew a parallel to the three foundational dimensions of our physical world: the X, Y, and Z axes. By mapping these three time units to three distinct spatial planes, invisible time is given a physical, structural skeleton within a 3D coordinate system.',
            'But as modern physics suggests, the fourth dimension is time. Following this logic, I envisioned the clock itself as a planet navigating through a four-dimensional universe. Within this planetary model, not only do seconds, minutes, and hours operate on localized vertical and horizontal planes, but the system also incorporates Earth’s macro-temporal scale. Real-world data for the year, month, and day are translated into the clock’s actual orbital path and axial tilt.',
            'Visually, the clock hands are represented by a breathing, continuously warping topology. This visual expression is inspired by modern cosmology: under the pressure of gravitational fields, physical forces, and the passage of time, the fabric of the universe is not perfectly flat, but constantly bending and collapsing. The distorted, noise-generated tubular trajectories serve as a direct, tangible materialization of this “spacetime distortion.”',
        ],
    },
    {
        id: 'halftone',
        title: 'Halftone Camera',
        kinds: ['code'],
        description: 'A p5.js camera sketch — halftone, with a little moiré effect.',
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
        description: 'Global Game Jam 2025 (theme: Bubble) — a 2-day rhythm multitasking game.',
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
];
