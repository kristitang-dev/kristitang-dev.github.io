import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/** Click map for the hero model. `section` scrolls the homepage. `route` opens a site page. `url` opens an external link. */
const HOTSPOTS: {
  label: string
  test: (name: string) => boolean
  section?: string
  route?: string
  url?: string
}[] = [
  {
    label: 'Bookshelf',
    test: (name) => name.startsWith('Book'),
    section: 'bookshelf',
  },
  {
    label: 'About',
    test: (name) => name.startsWith('Chair'),
    section: 'about',
  },
  {
    label: 'Work',
    test: (name) => name.startsWith('Laptop'),
    section: 'work',
  },
  {
    label: 'Sandbox',
    test: (name) => name === 'LedWall',
    section: 'sandbox',
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
  const cx = (fit.minX + fit.maxX) / 2
  const cy = (fit.minY + fit.maxY) / 2
  const halfW = spanX / spanY > aspect ? spanX / 2 : (spanY / 2) * aspect
  const halfH = halfW / aspect
  camera.left = cx - halfW
  camera.right = cx + halfW
  camera.top = cy + halfH
  camera.bottom = cy - halfH
  camera.updateProjectionMatrix()
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
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

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

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.rotateSpeed = 0.7
    controls.zoomSpeed = 0.7
    controls.minPolarAngle = 0.25
    controls.maxPolarAngle = Math.PI / 2 - 0.04
    controls.minZoom = 0.7
    controls.maxZoom = 2.6
    camera.position.set(8, 8, 8)
    controls.update()
    canvas.style.cursor = ''

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

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height, false)
      frameCamera(camera, fit, width / height, introScale)
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
      laptopPivot = pivotParts(model, (name) => name.startsWith('Laptop'))
      cameraRig = model.getObjectByName('Camera001')
        ?? model.getObjectByName('Camera.001')
        ?? null

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
        if (setPointer(event)) dragCamera()
        dragged = true
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
          canvas.classList.add('is-dragging')
          clearHover()
          return
        }
      }
      let spot = hitTest(event)
      cameraHover = pointerNearCamera()
      if (cameraHover) spot = null
      if (!spot) canvas.title = cameraHover ? 'Camera' : ''
      const label = spot?.label ?? null
      if (label === hovered) return
      clearHover()
      if (!spot || !label) return
      hovered = label
      canvas.classList.add('is-link')
      canvas.title = spot.label
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
      canvas.classList.remove('is-dragging')
      clearHover()
    }

    const onClick = (event: MouseEvent) => {
      if (dragged) return
      const spot = hitTest(event)
      if (!spot) return
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
    canvas.addEventListener('click', onClick)

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const clock = new THREE.Clock()
    let raf = 0
    const animate = () => {
      const time = clock.getElapsedTime()
      if (!reduceMotion) scrollUniform.value = time * 0.22
      const chairGoal = (hovered === 'About' ? -0.72 : 0) + (reduceMotion ? 0 : Math.sin(time * 0.85) * 0.04)
      const laptopGoal = hovered === 'Work' ? 0.22 : 0
      const cameraGoal = cameraHover ? 0.22 : 0
      const bookGoal = hovered === 'Bookshelf' ? 1 : 0
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
      canvas.removeEventListener('click', onClick)
      controls.dispose()
      observer.disconnect()
      wallMaterial.dispose()
      codeMap.dispose()
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
    <canvas
      ref={canvasRef}
      className="hero-scene__canvas"
      aria-label="Workspace model. Drag the desk camera to move it, or drag elsewhere to turn the view. Scroll to zoom. The bookcase, chair, laptop, and code wall can be clicked."
    />
  )
}
