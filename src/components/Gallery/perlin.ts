const GRAD = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const

const perm = new Uint8Array(512)

function buildPerm(seed: number) {
  const source = new Uint8Array(256)
  for (let i = 0; i < 256; i += 1) source[i] = i
  let state = seed
  for (let i = 255; i > 0; i -= 1) {
    state = (state * 16807) % 2147483647
    const j = state % (i + 1)
    const swap = source[i]
    source[i] = source[j]
    source[j] = swap
  }
  for (let i = 0; i < 512; i += 1) perm[i] = source[i & 255]
}

buildPerm(11)

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/** Classic 2D Perlin noise, roughly in [-1, 1]. */
export function perlin2(x: number, y: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const xf = x - x0
  const yf = y - y0
  const u = fade(xf)
  const v = fade(yf)
  const xi = x0 & 255
  const yi = y0 & 255

  const dot = (hash: number, dx: number, dy: number) => {
    const g = GRAD[hash & 7]
    return g[0] * dx + g[1] * dy
  }

  const aa = perm[perm[xi] + yi]
  const ba = perm[perm[xi + 1] + yi]
  const ab = perm[perm[xi] + yi + 1]
  const bb = perm[perm[xi + 1] + yi + 1]
  const x1 = dot(aa, xf, yf) + (dot(ba, xf - 1, yf) - dot(aa, xf, yf)) * u
  const x2 = dot(ab, xf, yf - 1) + (dot(bb, xf - 1, yf - 1) - dot(ab, xf, yf - 1)) * u
  return x1 + (x2 - x1) * v
}
