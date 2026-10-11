---
title: Playful Interface - Develop by Hand
date: 2026-10-11
excerpt: A love letter, break-up letter, and “we need to talk” letter to the phone camera and camera roll.
---

*“It’s complicated.”* I shoot instant and old film cameras, and I wait for the right moment because every frame costs something. But my phone lets me shoot 50 versions of the same thing without a second thought. I love how instant and free it is, but I hate that nothing feels worth waiting for.

## Chosen digital experience

**Phone camera and camera roll.** I tap to shoot and swipe to browse, and there’s no cost, no waiting, and no limit.

## The tensions

1. **Free and infinite vs. scarce and chosen:** every shot should cost something.
2. **Instant vs. ritual waiting:** holding, shaking, and blowing on a photo are part of the experience of film.
3. **Fragile to conditions:** heat and cold change how an instant photo develops.

## Concept: *Develop by hand*

A photo is captured, but it is not shown right away. You hold the “print” and wait. It slowly appears from a faint, pale frame.

- **Hold is normal development.** Setting the card down slows it and leaves the image cool and thin.
- **Shake or blow to speed it up (vibration switch).** This is a folk ritual with instant film[!]. Peel-apart film makes you wait, and people shake or blow to hurry it. In the prototype, the more you shake, the faster the image develops.
- **Body warmth (temperature sensor).** Warmth also speeds development, but too much overdevelops it. Too much warmth gives a washed-out, warm-toned or blown-out image (adjusted in code). Holding it too little leaves it cold, which gives a bluish, low-contrast, slow image.

**[!One thing to note:]** Polaroid says not to shake integral film, and shaking doesn’t actually speed up development. The prototype is built on the *ritual and belief* rather than the chemistry, which is an interesting point to discuss.

## My plan

1. Capture a photo with the **ESP32-CAM** and send it over Wi-Fi to a webpage. (Can be tested with a webcam first.)
2. Add the **tilt/vibration switch** and count shakes. More shaking makes the image clearer faster.
3. Build a hand-held card or print holder so it feels like holding a photo.
4. Add **time-based development** so the image appears gradually even without shaking.
5. Add the **DS18B20 temperature sensor** later, and map hand warmth to speed and to a warm/cold color treatment in code.
6. Optionally show it on the **IPS LCD** and add buzzer feedback.
7. Use Wizard-of-Oz where needed.
8. Test with people who have film experience and people who don’t, and note what they do without prompting.
