import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useSpatialStore } from '../../store/spatialStore'
import type { KristiAvatar } from './KristiAvatar'

/**
 * The splat avatar. hero-room.glb is ~1.2x real scale (seat 0.51 m above the floor, desk 0.93 m), so she
 * is scaled to match. She shows up like a snapshot: fades in at a random spot (typing in the chair or
 * browsing the bookcase), lingers, fades away for a while, and repeats. Now and then she trips on the
 * desk's corner instead, lies there a moment and fades. She first appears a few seconds
 * after the room has loaded, and fades away while the visitor is using the room's objects.
 * A small Animator-style panel lets the visitor pin a state; Exit hands her back to the shuffle.
 * At the chair she rides on the chair pivot (seat centre, foot of the legs), facing the desk (-z).
 */
const AVATAR_SCALE = 1.2
const AVATAR_SEAT = { y: -0.03, z: -0.01 }
const CHAIR_TUCK = 0.72   // chair pulled in so her hands reach the laptop
/** In front of the bookcase's open (+x) side, facing it; her hands stay ~0.25 m off the shelves. */
const AVATAR_BOOKCASE = { x: 0.17, z: 0.34, turn: -Math.PI / 2 }
const FLOOR_Y = 0.698
/**
 * The trip clip walks 3.6 m (at her scale) before she falls, too long for the room, so it starts
 * `startAt` of the way in. She walks out from beside the desk's right end, angled towards the viewer,
 * catches her foot on the desk's front-right corner and falls onto the open floor in front.
 * x/z place the clip's origin, not where she appears.
 */
const AVATAR_TRIP = { x: 2.92, z: -2.2, turn: -Math.PI / 8, startAt: 0.25 }
const TRIP_CHANCE = 0.2
/** Animator states a visitor can pin from the panel beside the scene. */
const AVATAR_SNAPS = [
  { id: 'chair', label: 'Typing' },
  { id: 'bookcase', label: 'Browsing' },
  { id: 'trip', label: 'Tripping' },
] as const
type AvatarSnap = (typeof AVATAR_SNAPS)[number]['id']
const ANIMATOR_ROWS = [12, 35, 58]   // centre y (px) of each state node in the panel
const TRIP_LIE_STILL = 1.2   // seconds she stays down after the clip ends, before fading
const AVATAR_SHOWN = [12, 22] as const   // seconds visible per snapshot, random within
const AVATAR_AWAY = [5, 12] as const     // seconds gone between snapshots
const AVATAR_COMEBACK = 2.5   // gone at least this long after the visitor stops interacting
const AVATAR_FIRST_DELAY = 5  // seconds after the room loads before her first appearance
const DESK_DROP = 0.06    // lower the desk (and what's on it) so her typing hands clear the top
/** Props shrunk to the same 1.2x scale (they were modelled about twice too big next to her). */
const LAPTOP_SCALE = 0.55
const LAPTOP_NUDGE = { x: -0.2, z: 0.1 }   // in front of the chair, keyboard under her hands
const CAMERA_SCALE = 0.6
const CAMERA_X = -0.85    // its old spot is hidden behind her head; move it along the desk to the open end

/** Share of the canvas's spare width moved from the room's right side to its left (0 = centred). */
const SCENE_ALIGN_RIGHT = 0.7

/** Click map for the hero model. `section` scrolls the homepage. `route` opens a site page. `url` opens an external link. */
const HOTSPOTS: {
  label: string
  title?: string
  test: (name: string) => boolean
  section?: string
  route?: string
  url?: string
  action?: 'laptop' | 'bookshelf' | 'about'
}[] = [
  {
    label: 'Bookshelf',
    title: 'Open archive',
    test: (name) => name.startsWith('Book'),
    action: 'bookshelf',
  },
  {
    label: 'About',
    test: (name) => name.startsWith('Chair'),
    action: 'about',
  },
  {
    label: 'Work',
    title: 'Open projects',
    test: (name) => name.startsWith('Laptop'),
    action: 'laptop',
  },
  {
    label: 'Sandbox',
    title: 'Open projects',
    test: (name) => name === 'LedWall',
    action: 'laptop',
  },
]

const MODEL_URL = `${import.meta.env.BASE_URL}models/hero-room.glb`
const CODE_URL = `${import.meta.env.BASE_URL}models/code-wall.png`

const wallVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const wallFragment = /* glsl */ `
  uniform sampler2D map;
  uniform float scroll;
  varying vec2 vUv;

  void main() {
    vec2 uv = vec2(vUv.x, fract(vUv.y - scroll));
    float mask = texture2D(map, uv).r;
    float grad = clamp(vUv.y, 0.0, 1.0);
    vec3 bg = mix(vec3(0.909, 0.937, 1.0), vec3(0.027, 0.132, 0.871), grad);
    vec3 glyph = mix(vec3(0.668, 0.766, 1.0), vec3(1.0), grad);
    gl_FragColor = vec4(mix(bg, glyph, mask), 1.0);
    #include <colorspace_fragment>
  }
`

function dropOffset(delay: number, distance: number, t: number, duration = 0.9) {
  const u = Math.min(1, Math.max(0, (t - delay) / duration))
  const eased = 1 - (1 - u) ** 3
  return distance * (1 - eased)
}

function frameCamera(
  camera: THREE.OrthographicCamera,
  fit: { minX: number; maxX: number; minY: number; maxY: number },
  aspect: number,
  zoomOut = 1,
) {
  const spanX = (fit.maxX - fit.minX) * 1.14 * zoomOut
  const spanY = (fit.maxY - fit.minY) * 1.14 * zoomOut
  const cy = (fit.minY + fit.maxY) / 2
  const halfW = spanX / spanY > aspect ? spanX / 2 : (spanY / 2) * aspect
  const halfH = halfW / aspect
  // when the canvas is wider than the room needs, slide the room towards the right edge
  const cx = (fit.minX + fit.maxX) / 2 - (halfW - spanX / 2) * SCENE_ALIGN_RIGHT
  camera.left = cx - halfW
  camera.right = cx + halfW
  camera.top = cy + halfH
  camera.bottom = cy - halfH
  camera.updateProjectionMatrix()
}

/** Scale an object about its own origin, then drop it so its lowest point stays where it was. */
function shrinkInPlace(obj: THREE.Object3D, factor: number) {
  const before = new THREE.Box3().setFromObject(obj)
  obj.scale.multiplyScalar(factor)
  obj.updateWorldMatrix(true, true)
  const after = new THREE.Box3().setFromObject(obj)
  const world = obj.getWorldPosition(new THREE.Vector3())
  world.y += before.min.y - after.min.y
  obj.position.copy(obj.parent ? obj.parent.worldToLocal(world) : world)
}

/** Shorten an object by `amount` (world units), keeping its bottom on the floor. */
function shortenFromBottom(obj: THREE.Object3D, amount: number) {
  const before = new THREE.Box3().setFromObject(obj)
  const height = before.max.y - before.min.y
  obj.scale.y *= (height - amount) / height
  obj.updateWorldMatrix(true, true)
  obj.position.y += before.min.y - new THREE.Box3().setFromObject(obj).min.y
}

function hotspotFor(name: string) {
  return HOTSPOTS.find((spot) => spot.test(name))
}

function pivotParts(root: THREE.Object3D, test: (name: string) => boolean) {
  const parts: THREE.Object3D[] = []
  root.traverse((obj) => {
    if (!test(obj.name)) return
    if (obj.parent && test(obj.parent.name)) return
    parts.push(obj)
  })
  if (parts.length === 0 || !root.parent) return null
  root.updateWorldMatrix(true, true)
  const box = new THREE.Box3()
  for (const part of parts) box.expandByObject(part)
  const pivot = new THREE.Group()
  const center = box.getCenter(new THREE.Vector3())
  center.y = box.min.y
  pivot.position.copy(center)
  root.parent.add(pivot)
  for (const part of parts) pivot.attach(part)
  return pivot
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatorRef = useRef<HTMLDivElement>(null)
  const [animatorOpen, setAnimatorOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const animatorEl = animatorRef.current

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 80)
    scene.add(camera)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe4ebf8, 1.15))
    const key = new THREE.DirectionalLight(0xfffaf6, 1.9)
    key.position.set(7.5, 9.5, 6.5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xf7f9ff, 1)
    fill.position.set(-7, 6, 4.5)
    scene.add(fill)
    const front = new THREE.DirectionalLight(0xffffff, 0.55)
    front.position.set(3.5, 7, 9)
    scene.add(front)

    const traceDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xfff7f2,
        transparent: true,
        opacity: 0,
        depthTest: false,
      }),
    )
    traceDot.renderOrder = 3
    scene.add(traceDot)
    let traceGlow = 0

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableRotate = false
    controls.rotateSpeed = 0.7
    controls.minPolarAngle = 0.25
    controls.maxPolarAngle = Math.PI / 2 - 0.04
    camera.position.set(8, 8, 8)
    controls.update()
    canvas.style.cursor = ''
    // OrbitControls sets touch-action: none, which traps trackpad and touch scrolling.
    canvas.style.touchAction = 'pan-y'

    const scrollUniform = { value: 0 }
    const codeMap = new THREE.TextureLoader().load(CODE_URL)
    codeMap.wrapS = THREE.RepeatWrapping
    codeMap.wrapT = THREE.RepeatWrapping
    codeMap.colorSpace = THREE.NoColorSpace
    codeMap.magFilter = THREE.LinearFilter
    codeMap.minFilter = THREE.LinearFilter
    codeMap.generateMipmaps = false

    const wallMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: codeMap },
        scroll: scrollUniform,
      },
      vertexShader: wallVertex,
      fragmentShader: wallFragment,
      toneMapped: false,
    })

    let model: THREE.Object3D | null = null
    let avatar: KristiAvatar | null = null
    let avatarShown = false
    let avatarSnap: AvatarSnap | null = null
    let avatarUntil = 0         // end of the current snapshot, or of the gap before the next one
    let requestedSnap: AvatarSnap | null = null
    let pinnedSnap: AvatarSnap | null = null   // picked in the Animator panel; null = random shuffle
    let exitRequested = false
    let hintPointing = false
    const randomIn = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)
    const randomSnap = (): AvatarSnap => {
      const roll = Math.random()
      return roll < TRIP_CHANCE ? 'trip' : roll < (1 + TRIP_CHANCE) / 2 ? 'chair' : 'bookcase'
    }

    // a snapshot: cut straight to a spot, mid-activity (or the whole trip, from the start)
    const showAvatar = (time: number, snap: AvatarSnap = randomSnap()) => {
      if (!avatar || !chairPivot) return
      avatarShown = true
      avatarSnap = snap
      avatarUntil = pinnedSnap ? Infinity : time + randomIn(AVATAR_SHOWN)
      if (snap === 'trip') {
        scene.add(avatar.root)
        avatar.root.position.set(AVATAR_TRIP.x, FLOOR_Y, AVATAR_TRIP.z)
        avatar.root.rotation.set(0, AVATAR_TRIP.turn, 0)
        avatar.play('Tripping', true, AVATAR_TRIP.startAt)
        // pinned: trip once and stay down until another state or Exit is picked
        if (!pinnedSnap) avatarUntil = time + avatar.duration('Tripping') * (1 - AVATAR_TRIP.startAt) + TRIP_LIE_STILL
      } else if (snap === 'chair') {
        chairPivot.add(avatar.root)
        avatar.root.position.set(0, AVATAR_SEAT.y, AVATAR_SEAT.z)
        avatar.root.rotation.set(0, Math.PI, 0)
        avatar.play('Typing', false, Math.random())
      } else {
        scene.add(avatar.root)
        avatar.root.position.set(AVATAR_BOOKCASE.x, FLOOR_Y, AVATAR_BOOKCASE.z)
        avatar.root.rotation.set(0, AVATAR_BOOKCASE.turn, 0)
        avatar.play('Browsing', false, Math.random())
      }
      avatar.fadeTo(1, 0.8)
    }

    // Animator panel: a state pins that snapshot (looping; the trip plays once and she stays down),
    // Exit returns to the shuffle
    const stateButtons = Array.from(animatorEl?.querySelectorAll<HTMLButtonElement>('[data-snap]') ?? [])
    const exitButton = animatorEl?.querySelector<HTMLButtonElement>('[data-exit]') ?? null
    const onStateClick = (event: MouseEvent) => {
      pinnedSnap = (event.currentTarget as HTMLButtonElement).dataset.snap as AvatarSnap
      requestedSnap = pinnedSnap
    }
    const onExitClick = () => {
      if (!pinnedSnap) return
      pinnedSnap = null
      exitRequested = true
    }
    for (const button of stateButtons) button.addEventListener('click', onStateClick)
    exitButton?.addEventListener('click', onExitClick)
    let markedSnap: AvatarSnap | null = null
    let markedPinned: AvatarSnap | null = null
    const markAnimator = (snap: AvatarSnap | null) => {
      if (snap !== markedSnap || pinnedSnap !== markedPinned) {
        markedSnap = snap
        markedPinned = pinnedSnap
        for (const button of stateButtons) {
          const id = button.dataset.snap
          button.classList.toggle('is-active', id === snap)
          button.setAttribute('aria-pressed', String(id === pinnedSnap))
        }
        animatorEl?.classList.toggle('is-pinned', pinnedSnap !== null)
        if (exitButton) exitButton.disabled = pinnedSnap === null
      }
      const bar = snap && animatorEl?.querySelector<HTMLElement>(`[data-snap="${snap}"] .hero-animator__bar`)
      if (bar && avatar) bar.style.transform = `scaleX(${Math.min(1, avatar.progress()).toFixed(3)})`
    }

    const hideAvatar = (time: number, seconds: number) => {
      avatarShown = false
      avatarUntil = time + randomIn(AVATAR_AWAY)
      avatar?.fadeTo(0, seconds)
    }

    // she also steps out while the visitor is busy with the room, and returns no sooner than
    // AVATAR_COMEBACK after (to her pinned state, if there is one)
    const updateAvatar = (time: number, busy: boolean) => {
      if (!avatar) return
      if (busy) {
        if (avatarShown) hideAvatar(time, 0.3)
        avatarUntil = Math.max(avatarUntil, time + AVATAR_COMEBACK)
      }
      if (exitRequested) {
        exitRequested = false
        if (avatarShown) hideAvatar(time, 0.6)
      } else if (requestedSnap && !busy) {
        showAvatar(time, requestedSnap)
        requestedSnap = null
      } else if (avatarShown && time > avatarUntil) {
        hideAvatar(time, 0.9)
      } else if (!avatarShown && !busy && time > avatarUntil && avatar.opacity() === 0) {
        showAvatar(time, pinnedSnap ?? randomSnap())
      }
      markAnimator(avatarShown ? avatarSnap : null)
    }
    let chairPivot: THREE.Group | null = null
    let laptopPivot: THREE.Group | null = null
    let chairSpin = 0
    let laptopLift = 0
    let cameraLift = 0
    let cameraHover = false
    let cameraRig: THREE.Object3D | null = null
    const cameraCenter = new THREE.Vector3()
    const cameraClosest = new THREE.Vector3()
    const cameraSize = new THREE.Vector3()
    const cameraBox = new THREE.Box3()
    let floatBook: THREE.Object3D | null = null
    const bookBase = new THREE.Vector3()
    let bookOut = 0
    let fit = { minX: -1, maxX: 1, minY: -1, maxY: 1 }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let introScale = 1
    let introLive = false
    let introEpoch = 0
    const introPieces: {
      obj: THREE.Object3D
      rest: number
      delay: number
      distance: number
      axis: 'x' | 'y'
      duration: number
    }[] = []
    let cameraDragging = false
    const dragPlane = new THREE.Plane()
    const dragHit = new THREE.Vector3()
    const dragOffset = new THREE.Vector3()
    const dragWorld = new THREE.Vector3()
    const dragUp = new THREE.Vector3(0, 1, 0)

    // line the Animator up under the code wall's right edge. Measured against the settled framing
    // (not the zoomed-out intro), so it doesn't jump when the intro finishes.
    const wallBox = new THREE.Box3()
    const wallCorner = new THREE.Vector3()
    const settledCamera = camera.clone()
    const alignAnimator = () => {
      const wall = model?.getObjectByName('LedWall')
      if (!wall || !animatorEl || canvas.clientHeight === 0) return
      wallBox.setFromObject(wall)
      settledCamera.copy(camera)
      frameCamera(settledCamera, fit, canvas.clientWidth / canvas.clientHeight)
      settledCamera.updateMatrixWorld()
      let maxX = -Infinity
      for (let i = 0; i < 8; i++) {
        wallCorner.set(i & 1 ? wallBox.max.x : wallBox.min.x, i & 2 ? wallBox.max.y : wallBox.min.y, i & 4 ? wallBox.max.z : wallBox.min.z)
        maxX = Math.max(maxX, wallCorner.project(settledCamera).x)
      }
      const right = canvas.clientWidth * (1 - (maxX + 1) / 2)
      animatorEl.style.right = `${Math.max(0, right).toFixed(1)}px`
    }

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height, false)
      frameCamera(camera, fit, width / height, introScale)
      alignAnimator()
      // setSize wipes the canvas, and ResizeObserver fires after this frame's
      // render, so redraw now or the scene flashes blank / clipped while resizing.
      renderer.render(scene, camera)
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const clickable: THREE.Mesh[] = []
    let hovered: string | null = null
    const lit = new Map<THREE.MeshStandardMaterial, { color: THREE.Color; intensity: number }>()

    const clearHover = () => {
      for (const [mat, prev] of lit) {
        mat.emissive.copy(prev.color)
        mat.emissiveIntensity = prev.intensity
      }
      lit.clear()
      hovered = null
      canvas.classList.remove('is-link')
      canvas.removeAttribute('title')
    }

    const meshesFor = (id: string) =>
      clickable.filter((mesh) => hotspotFor(mesh.name)?.label === id)

    const loader = new GLTFLoader()
    let disposed = false
    loader.load(MODEL_URL, (gltf) => {
      if (disposed) return
      model = gltf.scene
      scene.add(model)

      const importedLights: THREE.Object3D[] = []
      model.traverse((obj) => {
        if ((obj as THREE.Light).isLight) importedLights.push(obj)
        if (!(obj as THREE.Mesh).isMesh) return
        const mesh = obj as THREE.Mesh
        if (mesh.name === 'LedWall') mesh.material = wallMaterial
        if (hotspotFor(mesh.name)) clickable.push(mesh)
        if (mesh.name === 'LaptopScreenContent') {
          const mat = mesh.material
          if (!Array.isArray(mat) && mat instanceof THREE.MeshStandardMaterial) {
            mat.emissive = new THREE.Color(0xffffff)
            mat.emissiveMap = mat.map
            mat.emissiveIntensity = 1.5
          }
        }
      })
      for (const light of importedLights) light.parent?.remove(light)

      chairPivot = pivotParts(model, (name) => name.startsWith('Chair'))
      if (chairPivot) chairPivot.position.z -= CHAIR_TUCK
      laptopPivot = pivotParts(model, (name) => name.startsWith('Laptop'))
      cameraRig = model.getObjectByName('Camera001')
        ?? model.getObjectByName('Camera.001')
        ?? null
      const tabletop = model.getObjectByName('Tabletop')
      if (tabletop) tabletop.position.y -= DESK_DROP
      for (const name of ['Cube001', 'Cube.001', 'Cube002', 'Cube.002']) {
        const side = model.getObjectByName(name)
        if (side) shortenFromBottom(side, DESK_DROP)
      }
      if (laptopPivot) {
        laptopPivot.scale.setScalar(LAPTOP_SCALE)   // pivot sits at the base, so it stays on the desk
        laptopPivot.position.x += LAPTOP_NUDGE.x
        laptopPivot.position.y -= DESK_DROP
        laptopPivot.position.z += LAPTOP_NUDGE.z
      }
      if (cameraRig) {
        shrinkInPlace(cameraRig, CAMERA_SCALE)
        cameraRig.position.x = CAMERA_X
        cameraRig.position.y -= DESK_DROP
      }

      const drop: THREE.Object3D[] = []
      model.traverse((obj) => {
        if (/backdrop/i.test(obj.name) || obj.name === 'DiscLaptop' || obj.name === 'DiscChair') {
          drop.push(obj)
        }
      })
      for (const obj of drop) {
        obj.removeFromParent()
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          for (const mat of mats) mat?.dispose()
        }
      }

      floatBook = model.getObjectByName('Book026')
        ?? model.getObjectByName('Book.026')
        ?? null
      if (floatBook) bookBase.copy(floatBook.position)

      const pushDrop = (
        obj: THREE.Object3D | null,
        delay: number,
        distance: number,
        axis: 'x' | 'y' = 'y',
        duration = 0.9,
      ) => {
        if (!obj) return
        introPieces.push({
          obj,
          rest: axis === 'x' ? obj.position.x : obj.position.y,
          delay,
          distance,
          axis,
          duration,
        })
      }
      const blocked = (obj: THREE.Object3D) => {
        let parent = obj.parent
        while (parent) {
          if (parent === chairPivot || parent === laptopPivot || parent === cameraRig) return true
          parent = parent.parent
        }
        return false
      }
      const deskName = (name: string) =>
        name === 'Tabletop' || name === 'Cube' || name === 'Cube001' || name === 'Cube002'
        || name === 'Cube.001' || name === 'Cube.002'
      model.traverse((obj) => {
        if (blocked(obj) || obj === cameraRig) return
        const parentName = obj.parent?.name ?? ''
        if (deskName(parentName) || parentName.startsWith('Book') || parentName === 'LedWall') return
        if (deskName(obj.name)) pushDrop(obj, 0, 1.15)
        else if (obj.name.startsWith('Book')) pushDrop(obj, 0.1, -1.5, 'x', 1.15)
      })
      pushDrop(chairPivot, 0.26, 1.15)
      pushDrop(laptopPivot, 0.16, 1.7, 'y', 1.05)
      pushDrop(cameraRig, 0.22, 1.6, 'y', 1)

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      camera.position.copy(center).add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(18))
      camera.lookAt(center)
      controls.target.copy(center)
      controls.update()
      camera.updateMatrixWorld(true)

      const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
      ]
      fit = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
      for (const corner of corners) {
        const projected = corner.applyMatrix4(camera.matrixWorldInverse)
        fit.minX = Math.min(fit.minX, projected.x)
        fit.maxX = Math.max(fit.maxX, projected.x)
        fit.minY = Math.min(fit.minY, projected.y)
        fit.maxY = Math.max(fit.maxY, projected.y)
      }
      introEpoch = performance.now()
      introLive = !reduceMotion
      introScale = reduceMotion ? 1 : 1.5
      resize()

      avatarUntil = clock.getElapsedTime() + AVATAR_FIRST_DELAY
      import('./KristiAvatar').then(({ createKristiAvatar }) => createKristiAvatar(renderer, 'Typing')).then((loaded) => {
        if (disposed || !chairPivot) {
          loaded.dispose()
          return
        }
        avatar = loaded
        avatar.root.scale.setScalar(AVATAR_SCALE)
        // only the crouched part of the clip (it crouches down by 3 s and stands back up after 11 s)
        avatar.trimClip('Looking Through Files', 'Browsing', 3.2, 10.6)
        scene.add(avatar.spark)
        animatorEl?.classList.add('is-ready')
        if (import.meta.env.DEV) (window as unknown as { kristiAvatar: KristiAvatar }).kristiAvatar = avatar
      })
    })

    const setPointer = (event: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      return true
    }

    const hitTest = (event: { clientX: number; clientY: number }) => {
      if (!setPointer(event)) return null
      const hit = raycaster.intersectObjects(clickable, false)[0]
      if (!hit) return null
      return hotspotFor(hit.object.name) ?? null
    }

    const pointerNearCamera = () => {
      if (!cameraRig) return false
      cameraBox.setFromObject(cameraRig)
      cameraBox.getCenter(cameraCenter)
      cameraBox.getSize(cameraSize)
      raycaster.ray.closestPointToPoint(cameraCenter, cameraClosest)
      const reach = Math.max(0.36, cameraSize.length() * 0.75)
      if (cameraClosest.distanceTo(cameraCenter) >= reach) return false
      const hit = raycaster.intersectObjects(clickable, false)[0]
      const camDist = cameraClosest.distanceTo(raycaster.ray.origin)
      return !hit || camDist + 0.02 < hit.distance
    }

    const dragCamera = () => {
      if (!cameraRig?.parent || !raycaster.ray.intersectPlane(dragPlane, dragHit)) return
      dragHit.add(dragOffset)
      cameraRig.parent.worldToLocal(dragHit)
      cameraRig.position.x = dragHit.x
      cameraRig.position.z = dragHit.z
    }

    let downX = 0
    let downY = 0
    let dragged = false

    const onDown = (event: PointerEvent) => {
      downX = event.clientX
      downY = event.clientY
      dragged = false
      if (!setPointer(event) || !pointerNearCamera() || !cameraRig) return
      cameraDragging = true
      cameraHover = true
      controls.enabled = false
      cameraRig.getWorldPosition(dragWorld)
      dragPlane.setFromNormalAndCoplanarPoint(dragUp, dragWorld)
      if (raycaster.ray.intersectPlane(dragPlane, dragHit)) dragOffset.copy(dragWorld).sub(dragHit)
      else dragOffset.set(0, 0, 0)
      canvas.classList.add('is-dragging')
      canvas.title = 'Camera'
    }

    const onUp = () => {
      cameraDragging = false
      controls.enabled = true
      canvas.classList.remove('is-dragging')
    }

    const onMove = (event: PointerEvent) => {
      if (cameraDragging) {
        const moved = Math.hypot(event.clientX - downX, event.clientY - downY)
        if (moved > 4) {
          dragged = true
          if (setPointer(event)) dragCamera()
          event.preventDefault()
        }
        canvas.classList.add('is-dragging')
        canvas.title = 'Camera'
        return
      }
      if (event.target !== canvas) return
      if (event.buttons & 1) {
        const moved = Math.hypot(event.clientX - downX, event.clientY - downY)
        if (moved > 4) {
          dragged = true
          cameraHover = false
          canvas.classList.remove('is-camera')
          clearHover()
          return
        }
      }
      let spot = hitTest(event)
      cameraHover = pointerNearCamera()
      canvas.classList.toggle('is-camera', cameraHover)
      if (cameraHover) spot = null
      if (!spot) canvas.title = cameraHover ? 'Camera' : ''
      const label = spot?.label ?? null
      if (label === hovered) return
      clearHover()
      if (!spot || !label) return
      hovered = label
      canvas.classList.add('is-link')
      canvas.title = spot.title ?? spot.label
      for (const mesh of meshesFor(label)) {
        const mat = mesh.material
        if (Array.isArray(mat) || !(mat instanceof THREE.MeshStandardMaterial)) continue
        if (lit.has(mat)) continue
        lit.set(mat, { color: mat.emissive.clone(), intensity: mat.emissiveIntensity })
        if (mat.emissive.getHex() === 0x000000) {
          mat.emissive.setRGB(0.22, 0.22, 0.22)
        } else {
          mat.emissiveIntensity += 0.15
        }
      }
    }

    const onLeave = () => {
      if (cameraDragging) return
      cameraHover = false
      canvas.classList.remove('is-dragging', 'is-camera')
      clearHover()
    }

    const onClick = (event: MouseEvent) => {
      if (dragged) {
        dragged = false
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (setPointer(event) && pointerNearCamera()) {
        useSpatialStore.getState().setActiveOverlay('camera')
        return
      }
      const spot = hitTest(event)
      if (!spot) return
      if (spot.action === 'laptop' || spot.action === 'bookshelf') {
        useSpatialStore.getState().setActiveOverlay(spot.action)
        return
      }
      if (spot.action === 'about') {
        useSpatialStore.getState().scrollToAbout()
        return
      }
      if (spot.url) {
        window.open(spot.url, '_blank', 'noopener')
        return
      }
      if (spot.route) {
        navigate(spot.route)
        return
      }
      if (spot.section) {
        document.getElementById(spot.section)?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    canvas.addEventListener('pointerdown', onDown, true)
    canvas.addEventListener('pointerup', onUp)
    window.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointermove', onMove)
    window.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick, true)

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const clock = new THREE.Clock()
    let raf = 0
    let lastTime = 0
    const animate = () => {
      const time = clock.getElapsedTime()
      if (!reduceMotion) scrollUniform.value = time * 0.22
      const spatial = useSpatialStore.getState()
      const busy = hovered !== null || cameraHover || cameraDragging || spatial.activeOverlay !== null
      updateAvatar(time, busy)
      // the hint cheers "click!" while the pointer is on an object
      const pointing = hovered !== null || cameraHover
      if (pointing !== hintPointing) {
        hintPointing = pointing
        animatorEl?.classList.toggle('is-pointing', pointing)
      }
      avatar?.update(time - lastTime)
      lastTime = time
      const chairGoal = (hovered === 'About' ? -0.72 : 0) + (reduceMotion ? 0 : Math.sin(time * 0.85) * 0.04)
      const laptopGoal = hovered === 'Work' || spatial.activeOverlay === 'laptop' ? 0.22 : 0
      const cameraGoal = cameraHover || spatial.activeOverlay === 'camera' ? 0.22 : 0
      const bookGoal = hovered === 'Bookshelf' || spatial.activeOverlay === 'bookshelf' ? 1 : 0
      chairSpin += (chairGoal - chairSpin) * 0.07
      laptopLift += (laptopGoal - laptopLift) * 0.06
      cameraLift += (cameraGoal - cameraLift) * 0.06
      bookOut += (bookGoal - bookOut) * 0.07
      const introT = introLive ? (performance.now() - introEpoch) / 1000 : 99
      const chairTurn = reduceMotion ? 0 : dropOffset(0.26, 0.75, introT, 1.05)
      if (chairPivot) chairPivot.rotation.y = chairSpin + chairTurn
      if (introLive) {
        const u = Math.min(1, introT / 1.85)
        const eased = 1 - (1 - u) ** 3
        introScale = 1.5 + (1 - 1.5) * eased
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (width > 0 && height > 0) frameCamera(camera, fit, width / height, introScale)
        if (u >= 1) {
          introLive = false
          introScale = 1
        }
      }
      for (const piece of introPieces) {
        const travel = reduceMotion ? 0 : dropOffset(piece.delay, piece.distance, introT, piece.duration)
        if (piece.axis === 'x') {
          const extra = piece.obj === floatBook ? bookOut * 0.34 : 0
          piece.obj.position.x = piece.rest + extra + travel
        } else {
          let extra = 0
          if (piece.obj === laptopPivot) extra = laptopLift
          else if (piece.obj === cameraRig) extra = cameraLift
          piece.obj.position.y = piece.rest + extra + travel
        }
      }
      if (floatBook) floatBook.position.y = bookBase.y + bookOut * 0.08
      if (cameraRig) {
        cameraRig.getWorldPosition(dragWorld)
        traceDot.position.copy(dragWorld)
        traceDot.position.y += 0.07
        const traceGoal = cameraHover || cameraDragging ? 1 : 0
        traceGlow += (traceGoal - traceGlow) * 0.16
        const dotMat = traceDot.material as THREE.MeshBasicMaterial
        dotMat.opacity = traceGlow
      }
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onDown, true)
      canvas.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick, true)
      controls.dispose()
      observer.disconnect()
      wallMaterial.dispose()
      codeMap.dispose()
      traceDot.geometry.dispose()
      ;(traceDot.material as THREE.MeshBasicMaterial).dispose()
      scene.remove(traceDot)
      avatar?.dispose()
      for (const button of stateButtons) button.removeEventListener('click', onStateClick)
      exitButton?.removeEventListener('click', onExitClick)
      if (model) {
        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh
          if (!mesh.isMesh) return
          mesh.geometry.dispose()
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          for (const mat of mats) {
            if (mat === wallMaterial) continue
            mat.dispose()
          }
        })
      }
      renderer.dispose()
    }
  }, [navigate])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="hero-scene__canvas"
        aria-label="Workspace model. Drag the desk camera to move it, or click it to open photographs. The bookcase opens an archive, the chair scrolls to about, and the laptop and code wall open projects."
      />
      {/* className is set imperatively (is-ready, is-pinned), so React only owns data-open here */}
      <div ref={animatorRef} className="hero-animator" data-open={animatorOpen}>
        <div
          id="hero-animator-panel"
          className="hero-animator__panel"
          role="group"
          aria-label="Kristi's animator: pick a state, Exit to let her wander"
          inert={!animatorOpen}
        >
          <svg className="hero-animator__wires" viewBox="0 0 240 70" aria-hidden="true">
            <defs>
              <marker id="hero-animator-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M0 0 L6 3 L0 6 z" />
              </marker>
            </defs>
            {ANIMATOR_ROWS.map((y) => (
              <g key={y}>
                <path d={`M44 35 C64 35 64 ${y} 83 ${y}`} markerEnd="url(#hero-animator-arrow)" />
                <path d={`M156 ${y} C176 ${y} 176 35 199 35`} markerEnd="url(#hero-animator-arrow)" />
              </g>
            ))}
          </svg>
          <span className="hero-animator__node is-entry">Entry</span>
          {AVATAR_SNAPS.map((snap, i) => (
            <button
              key={snap.id}
              type="button"
              className="hero-animator__node is-state"
              style={{ top: ANIMATOR_ROWS[i] - 8 }}
              data-snap={snap.id}
              aria-pressed="false"
            >
              {snap.label}
              <i className="hero-animator__bar" />
            </button>
          ))}
          <button type="button" className="hero-animator__node is-exit" data-exit disabled>
            Exit
          </button>
        </div>
        <p className="hero-animator__hint">
          <span className="is-idle">
            <span aria-hidden="true">↖</span> <i>try clicking objects</i>
          </span>
          <i className="is-pointing" aria-hidden="true">click!</i>
        </p>
        <button
          type="button"
          className="hero-animator__toggle"
          aria-expanded={animatorOpen}
          aria-controls="hero-animator-panel"
          onClick={() => setAnimatorOpen((open) => !open)}
        >
          Animator
        </button>
      </div>
    </>
  )
}
