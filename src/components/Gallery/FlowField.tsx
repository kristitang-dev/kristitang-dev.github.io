import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { BufferAttribute, ShaderMaterial } from 'three'
import { perlin2 } from './perlin'
import { useSpatialStore } from '../../store/spatialStore'

const COUNT = 96
const BLUE = [0.169, 0.298, 0.494] as const
const RED = [0.839, 0.231, 0.231] as const

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * (22.0 / -mv.z), 2.0, 26.0);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.12, d);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * 0.72 * uAlpha);
  }
`

function createField() {
  const homes = new Float32Array(COUNT * 3)
  const positions = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const sizes = new Float32Array(COUNT)
  const seeds = new Float32Array(COUNT)

  for (let i = 0; i < COUNT; i += 1) {
    homes[i * 3] = (Math.random() - 0.5) * 14
    homes[i * 3 + 1] = (Math.random() - 0.5) * 9
    homes[i * 3 + 2] = -2.6 - Math.random() * 2.4
    sizes[i] = 6 + Math.random() * 12
    seeds[i] = Math.random() * 20
    const tint = Math.random() < 0.55 ? BLUE : RED
    const wash = 0.15 + Math.random() * 0.3
    colors[i * 3] = tint[0] + (1 - tint[0]) * wash
    colors[i * 3 + 1] = tint[1] + (1 - tint[1]) * wash
    colors[i * 3 + 2] = tint[2] + (1 - tint[2]) * wash
  }

  return { homes, positions, colors, sizes, seeds }
}

export function FlowField({ exiting = false }: { exiting?: boolean }) {
  const positionAttr = useRef<BufferAttribute>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const reduceMotion = useRef(false)
  const life = useRef(0)
  const fade = useRef(1)
  const uniforms = useMemo(() => ({ uAlpha: { value: 1 } }), [])
  const field = useMemo(createField, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      reduceMotion.current = media.matches
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  useFrame(({ clock }, delta) => {
    const step = Math.min(delta, 0.05)
    life.current += step
    const burst = reduceMotion.current ? 1 : Math.min(1, life.current / 0.95)
    const eased = 1 - (1 - burst) ** 3
    fade.current = exiting ? Math.max(0, fade.current - step / 0.5) : 1
    if (materialRef.current) materialRef.current.uniforms.uAlpha.value = fade.current

    const focused = useSpatialStore.getState().activeProjectId !== null
    const drift = (focused ? 0.4 : 1) * (exiting ? 0.35 : 1)
    const time = clock.elapsedTime * 0.045
    const { positions, homes, seeds } = field

    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3
      const hx = homes[i3]
      const hy = homes[i3 + 1]
      const hz = homes[i3 + 2]

      if (burst < 1) {
        positions[i3] = hx * eased
        positions[i3 + 1] = hy * eased
        positions[i3 + 2] = hz * eased
        continue
      }

      if (reduceMotion.current) {
        positions[i3] = hx
        positions[i3 + 1] = hy
        positions[i3 + 2] = hz
        continue
      }

      let x = positions[i3]
      let y = positions[i3 + 1]
      const nx = x * 0.14 + seeds[i]
      const ny = y * 0.14
      const eps = 0.22
      const vx = perlin2(nx, ny + eps + time) - perlin2(nx, ny - eps + time)
      const vy = perlin2(nx - eps, ny + time * 0.8) - perlin2(nx + eps, ny + time * 0.8)
      x += vx * step * 1.35 * drift
      y += vy * step * 1.35 * drift
      if (exiting) {
        x += x * step * 1.4
        y += y * step * 1.4
      }
      if (!exiting) {
        if (x > 7.4) x = -7.4
        if (x < -7.4) x = 7.4
        if (y > 4.8) y = -4.8
        if (y < -4.8) y = 4.8
      }
      positions[i3] = x
      positions[i3 + 1] = y
    }

    if (positionAttr.current) positionAttr.current.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttr}
          attach="attributes-position"
          args={[field.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[field.colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[field.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  )
}
