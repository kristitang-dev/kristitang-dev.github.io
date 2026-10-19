---
title: GenAI as Creative Material
date: 2026-10-17
excerpt: I chose Vincent van Gogh's First Steps, after Millet as my object.
cover: /images/garden/genai/first-steps-met.jpg
---

I chose Vincent van Gogh's *First Steps, after Millet* as my object.

![Vincent van Gogh, First Steps, after Millet, 1890. The Metropolitan Museum of Art.](/images/garden/genai/first-steps-met.jpg)

## Research

Vincent Van Gogh painted this in January 1890 while institutionalized at the Saint-Paul-de-Mausole asylum in Saint-Rémy, France. The late 19th-century Post-Impressionist aesthetic was moving away from strict optical realism toward emotional and psychological expression. While the Industrial Revolution was rapidly changing Europe, Van Gogh deeply romanticized the honest, grounding labor of the rural peasantry, an aesthetic heavily championed by Millet earlier in the century.

He worked from a black-and-white photograph of Millet’s original chalk and pastel drawing. Van Gogh applied the oil paint using an extreme impasto technique, laying down thick, unblended dashes of complementary colors.

![Millet’s chalk and pastel drawing beside Van Gogh’s First Steps, after Millet](/images/garden/genai/First%20Steps.png)

Housed at [The Metropolitan Museum of Art](https://www.metmuseum.org/art/collection/search/436526), it is now viewed as a masterpiece of emotional translation and color theory. It represents a poignant psychological artifact: a man confined to an asylum, battling severe mental illness, vividly reconstructing the ultimate symbol of domestic warmth and grounding familial connection.

However, the public largely did not see this work during his lifetime. In reality, Van Gogh's life was defined by an intense yearning for love, recognition, and worldly success, yet the world responded in the cruelest ways. He craved acceptance from the public and the mainstream art world, not only to validate his own worth but to repay his brother Theo for years of unconditional financial and emotional support. Ironically, despite this desperate desire for success, he sold only one painting while alive and struggled constantly with poverty and self-doubt.

Accompanying these intense worldly desires was a grueling, years-long battle with severe mental illness. By late 1888 in Arles, chronic malnutrition, excessive absinthe consumption, and frantic artistic output led to a total psychological breakdown, culminating in the infamous ear-mutilation incident. Following a petition by local residents to have him isolated, and terrified by the realization that he was losing his mind and could no longer live independently, Van Gogh made the sobering decision in May 1889 to voluntarily institutionalize himself at the Saint-Paul-de-Mausole asylum in Saint-Rémy.

![Van Gogh in Saint-Rémy: the asylum, The Starry Night, and translations after Millet](/images/garden/genai/in%20Saint-Remy.png)

1889 - 1890  
Vincent van Gogh spent one year in the mental hospital in Saint-Rémy-de-Provence.

It was also within these very asylum walls that he created his ultimate masterpiece, *The Starry Night*. Confined to his room at night, he would observe the pre-dawn sky through his iron-barred, east-facing window, unable to paint in the dark. Instead, he painted the scene from memory and deep imagination during the day. The violently swirling, explosive night sky in *The Starry Night* is not an optical reflection of reality, but a profound projection of his overwhelming psychological turbulence and his desperate search for the infinite. Just as he infused the calm domesticity of *First Steps* with vibrating, nervous energy, he transformed a quiet nocturnal landscape into a roaring, cosmic vector field. This masterpiece stands as the ultimate testament that while his physical body was locked away, his inner creative universe was expanding boundlessly.

Van Gogh viewed this process not as copying, but as "translating," comparing his role to a musician interpreting a composer's score. He provided the color and the passionate rhythm; Millet provided the structural melody.

![Letter 805 to Theo, with the line about improvising color on a Millet the way a bow moves on a violin](/images/garden/genai/Letter%20805.png)

[805 (806, 607): To Theo van Gogh. Saint-Rémy-de-Provence, on or about Friday, 20 September 1889.](https://vangoghletters.org/vg/letters/let805/letter.html#translation)

What I find most compelling and psychologically charged about this piece is the profound sense of vitality it radiates, especially knowing the immense mental suffering Van Gogh was enduring at the asylum. Despite his deep pain, his sensitivity to the gentle, soft, and beautiful moments of mundane life is incredibly moving. The painting conveys a powerful message: even when sorrow and sadness persist, new life and hope continually emerge. This resilience is what makes me feel truly alive when I look at it. Artistically, Van Gogh’s bold, signature brushstrokes and his vibrant color palette completely transform Millet’s static sketch into a dynamic, breathing masterpiece filled with the promise of new life ahead.

This emotional and visual tension relates directly to my own creative interests in spatial computing and interactive physical prototyping. Just as Vincent van Gogh used energetic brushstrokes to breathe life and vibrating energy into a static structural reference, I am deeply interested in how static data, rigid materials, or digital structures can be animated into living, interactive experiences through code and microcontrollers. The painting's ability to translate quiet domesticity into a pulsating, living force inspires me to explore how computational systems and spatial environments can evoke similar feelings of warmth, human connection, and raw vitality.

## Do Something to It
My text prompt and my sketch:

```
An oil painting with an extreme impasto texture. The color palette is vibrant, fresh, and spring-like, heavily utilizing bright yellow-greens contrasting with deep, emotional blues to suggest a sudden burst of new life overcoming a heavy atmosphere. The brushstrokes are thick, unblended, and repetitive, creating a swirling, vibrating rhythm across the canvas. In a shallow, enclosed rural garden, a crouching man on the left extends his arms openly. On the right, a woman gently supports a toddler leaning forward to take a step. There is an invisible, tender, yet powerful emotional pull between the toddler and the man's hands. Mundane background objects like a rustic fence and a wheelbarrow feel alive and pulsating due to the turbulent flow of the paint.
```
![I am not good at drawing](/images/garden/genai/My%20Sketch.jpg)

The Results:

![Generated images based on my Sketch](/images/garden/genai/Generated%20based%20on%20my%20sketch.png)


**How closely did each model follow my prompt?** ChatGPT followed my text over my drawing, and that layout also happens to match Van Gogh's real *First Steps*. Gemini matched my sketch's layout best, with the bare tree in the middle and the fence, but deep blue took over the "spring yellow-greens," and it turned my rural peasants into a modern family in jeans. ChatGPT matched the mood and palette best: bright, spring-like, thick unblended strokes, and a woman in a long pale dress that feels like the 1800s. Firefly followed my sketch almost too literally and my text the least. It looks flat and smooth, with a pale yellow sky instead of deep emotional blues and almost no impasto.

**What frustrated or perplexed me?** Firefly turned the father into a child. The figure on the left is a barefoot boy in shorts, and the adult on the right looks androgynous. It seems to have read my stick-figure proportions as kids, and it even turned my ground line into a strange crack across the lawn. Gemini gave me two wheelbarrows when I asked for one. All three defaulted to a young white couple with a blond toddler, even though I never mentioned race, age, or clothing. That is a bias worth noticing. There were no six-fingered hands, though ChatGPT's hands melt into the brushstrokes. Some of it also felt like slop: Gemini spread the same "Van Gogh" swirl evenly over every surface, and Firefly felt like a filter on top rather than actual painting.

**What surprised or humored me?** ChatGPT came closest to the original painting even though I never named it, probably because my prompt describes *First Steps* so closely. That is impressive and a little unsettling at the same time. Gemini turned a few stick lines into a believable scene that kept my poses, from the father's open arms to the mother bending over the child. Firefly's literalness was funny in its own way; it even kept the two-branch shape of my tree.

**At this point, would I call this work “my own”?** Definitely not.

## Do Something Else to It
I made a collage out of three generative art pieces, pulling one character from each of the three platforms I used. But now, it totally lost the whole 'resilience and new life' vibe. Instead, the dad looks absolutely terrified to hold the kid, like he's panicking and saying, 'The baby's not mine! I'm not ready to be a dad!' The funny part is that this "dad" is actually Firefly's child figure, placed next to Gemini's toddler and ChatGPT's mother.
![Collage art](/images/garden/genai/Collaged.png)



## Repeat?
And then I threw this collaged with the new text prompt into Seedance 2.0 mini to generate a video. 

```
In a shallow, enclosed rural garden, a crouching man on the left extends his arms openly. On the right, a woman gently supports a toddler leaning forward to take a step. The dad in the left side looks kinda terrified to hold the kid, like he's panicking and saying, 'The baby's not mine! I'm not ready to be a dad!'
```

![Animated collage: the father pulls back as the child steps toward him](/images/garden/genai/movingImage.gif)

[Watch with sound](https://drive.google.com/file/d/1ic3cQkagEr4mFntZLOEnOh0ivSFX2S00/view?usp=sharing)

I also asked my friends to do me a favor to replicate the scene. And I threw that picture into Gemini with similar prompts. I tried to give all-in-one prompt and step-by-step prompts. Below are the results:
![](/images/garden/genai/Photography.png)