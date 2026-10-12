---
title: Playful Interface - Develop by Hand
date: 2026-10-11
excerpt: A love letter, break-up letter, and “we need to talk” letter to the phone camera and camera roll.
---

*“It’s complicated.”* I shoot instant and old film cameras, and I wait for the right moment because every frame costs something. But my phone lets me shoot 50 versions of the same thing without a second thought. I love how instant and free it is, but I hate that nothing feels worth waiting for.

## Chosen digital experience

**Phone camera and camera roll.** I tap to shoot and swipe to browse, and there’s no cost, no waiting, and no limit.

![iPhone Camera Control opening the camera](https://static0.anpoimages.com/wordpress/wp-content/uploads/2024/09/iphone-16-camera-control-anim.gif?q=70&fit=crop&w=600&dpr=1)

One press, and the camera is open. I love how instant and free that is. I hate that nothing feels worth waiting for.

## The tensions

1. Free and infinite vs. scarce and chosen: every shot should cost something.
2. Instant vs. ritual waiting: holding, shaking, and blowing on a photo are part of the experience of film.
3. Fragile to conditions: heat and cold change how an instant photo develops.

## Concept: *Develop by hand*

A photo is captured, but it is not shown right away. You hold the “print” and wait. It slowly appears from a faint, pale frame.

- **Hold is normal development.** Setting the card down slows it and leaves the image cool and thin.
- **Shake or blow to speed it up (vibration switch).** This is a folk ritual with instant film[!]. Peel-apart film makes you wait, and people shake or blow to hurry it. In the prototype, the more you shake, the faster the image develops.
- **Body warmth (temperature sensor).** Warmth also speeds development, but too much overdevelops it. Too much warmth gives a washed-out, warm-toned or blown-out image (adjusted in code). Holding it too little leaves it cold, which gives a bluish, low-contrast, slow image.

[!]One thing to note: Polaroid says not to shake integral film, and shaking doesn’t actually speed up development. The prototype is built on the *ritual and belief* rather than the chemistry.

## My plan

1. Capture a photo with the ESP32-CAM and send it over Wi-Fi to a webpage. (Can be tested with a webcam first.)
2. Add the tilt/vibration switch and count shakes. More shaking makes the image clearer faster.
3. Build a hand-held card or print holder so it feels like holding a photo.
4. Add time-based development so the image appears gradually even without shaking.
5. Add the DS18B20 temperature sensor later, and map hand warmth to speed and to a warm/cold color treatment in code.
6. Optionally show it on the IPS LCD and add buzzer feedback.
7. Test with people who have film experience and people who don’t, and note what they do without prompting.

![Wiring for the Arduino Uno, ESP32, tilt switch, temperature sensor, shutter button, and screen](/images/garden/develop-by-hand/circuit.png)

The diagram simulation built on the Wokwi: [https://wokwi.com/projects/477649105868929025](https://wokwi.com/projects/477649105868929025)

## Prototype

An Arduino Uno reads a tilt switch, a shutter button, and a temperature sensor. An ESP32-CAM takes the picture, and the Uno is the only cable. I tried to show the print on a small IPS screen. The backlight came on, but the picture chip never drew an image, so I set that board aside. The webpage is the print for now.

![Develop by hand webpage, with a blank print waiting to develop](/images/garden/develop-by-hand/prototype.png) 