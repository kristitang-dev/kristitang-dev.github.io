/** Point `index` of `count` on a sphere, using the Fibonacci lattice. */
export function fibonacciSphere(
  index: number,
  count: number,
  radius: number,
): [number, number, number] {
  const y = 1 - ((index + 0.5) / count) * 2
  const ring = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = Math.PI * (3 - Math.sqrt(5)) * index
  return [Math.cos(theta) * ring * radius, y * radius, Math.sin(theta) * ring * radius]
}
