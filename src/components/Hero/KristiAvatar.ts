import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { SparkRenderer, SplatMesh, SplatSkinning } from '@sparkjsdev/spark'

const AVATAR_URL = `${import.meta.env.BASE_URL}models/avatar/`

type AvatarMeta = { numSplats: number; bones: string[]; clips: string[] }

export type KristiAvatar = {
  root: THREE.Group
  /** Draws every splat in the scene; add it to the scene alongside root. */
  spark: SparkRenderer
  /**
   * Loop a clip, or play it once and hold its last frame. With `startAt` (0..1 through the clip) it cuts
   * straight there instead of blending, e.g. to reappear mid-activity.
   */
  play: (name: string, once?: boolean, startAt?: number) => void
  /** Length of a clip in seconds (0 if unknown). */
  duration: (name: string) => number
  /** How far through its clip the current animation is, 0..1. */
  progress: () => number
  /**
   * Add `name` as the `from`..`to` seconds of clip `source`, looped back and forth so the cut points
   * never jump (e.g. just the crouched part of a crouch-browse-stand clip).
   */
  trimClip: (source: string, name: string, from: number, to: number) => void
  /** Fade towards fully shown (1) or gone (0); root is hidden while at 0. Starts at 0. */
  fadeTo: (target: number, seconds?: number) => void
  /** Current fade level, 0..1. */
  opacity: () => number
  update: (delta: number) => void
  dispose: () => void
}

/**
 * Gaussian-splat avatar skinned to a Mixamo skeleton. The splat (Spark) is bent on the GPU every frame
 * to follow the bones of kristi-rig.glb, which the AnimationMixer drives. Import this module dynamically:
 * Spark is ~5 MB and shouldn't hold up the rest of the page.
 */
export async function createKristiAvatar(renderer: THREE.WebGLRenderer, firstClip = 'Idle'): Promise<KristiAvatar> {
  const spark = new SparkRenderer({ renderer })
  const [meta, skinBytes, gltf] = await Promise.all([
    fetch(`${AVATAR_URL}kristi-avatar.json`).then((r) => r.json() as Promise<AvatarMeta>),
    fetch(`${AVATAR_URL}kristi-skin.bin`).then((r) => r.arrayBuffer()),
    new GLTFLoader().loadAsync(`${AVATAR_URL}kristi-rig.glb`),
  ])

  const root = new THREE.Group()
  const rig = gltf.scene
  root.add(rig)
  rig.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) obj.visible = false   // proxy body mesh, only used to build the skin weights
  })

  const splat = new SplatMesh({ url: `${AVATAR_URL}kristi-avatar.spz` })
  root.add(splat)
  await splat.initialized

  // kristi-skin.bin: per splat 4 bone indices then 4 weights (0-255), indices into meta.bones
  const bones = meta.bones.map((name) => rig.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name))!)
  const skinning = new SplatSkinning({ mesh: splat, numBones: bones.length })
  const skin = new Uint8Array(skinBytes)
  for (let i = 0; i < meta.numSplats; i++) {
    const o = i * 8
    for (let k = 0; k < 4; k++) skinning.skinData[i * 4 + k] = skin[o + 4 + k] + (skin[o + k] << 8)
  }
  skinning.skinTexture.needsUpdate = true

  // Spark's rest handling only composes correctly for an identity rest pose, so its rest stays identity
  // and each bone gets the full rest -> current transform: q = qNow * qRest^-1, t = pNow - q * pRest
  const m = new THREE.Matrix4()
  const pos = new THREE.Vector3()
  const quat = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const boneInRoot = (bone: THREE.Object3D) => {
    m.copy(root.matrixWorld).invert().multiply(bone.matrixWorld).decompose(pos, quat, scale)
  }
  root.updateMatrixWorld(true)
  const restQuatInv = bones.map((bone) => {
    boneInRoot(bone)
    return quat.clone().invert()
  })
  const restPos = bones.map((bone) => {
    boneInRoot(bone)
    return pos.clone()
  })
  bones.forEach((_, i) => skinning.setRestQuatPos(i, new THREE.Quaternion(), new THREE.Vector3()))
  splat.skinning = skinning
  splat.updateGenerator()

  const relQ = new THREE.Quaternion()
  const relT = new THREE.Vector3()
  const syncSplat = () => {
    root.updateMatrixWorld(true)
    bones.forEach((bone, i) => {
      boneInRoot(bone)
      relQ.copy(quat).multiply(restQuatInv[i])
      relT.copy(restPos[i]).applyQuaternion(relQ).negate().add(pos)
      skinning.setBoneQuatPos(i, relQ, relT)
    })
    skinning.updateBones()
  }

  const mixer = new THREE.AnimationMixer(rig)
  const actions = new Map(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]))
  let current: THREE.AnimationAction | null = null
  const pingPong = new Set<string>()

  const trimClip = (source: string, name: string, from: number, to: number) => {
    const clip = actions.get(source)?.getClip()
    if (!clip) return
    const fps = 30
    const part = THREE.AnimationUtils.subclip(clip, name, Math.round(from * fps), Math.round(to * fps), fps)
    actions.set(name, mixer.clipAction(part))
    pingPong.add(name)
  }

  const play = (name: string, once = false, startAt?: number) => {
    const next = actions.get(name)
    if (!next || (next === current && startAt === undefined)) return
    if (startAt !== undefined) mixer.stopAllAction()
    next.reset()
    next.setLoop(once ? THREE.LoopOnce : pingPong.has(name) ? THREE.LoopPingPong : THREE.LoopRepeat, Infinity)
    next.clampWhenFinished = once
    if (startAt !== undefined) next.time = startAt * next.getClip().duration
    next.play()
    if (current && startAt === undefined) next.crossFadeFrom(current, 0.35, false)
    current = next
  }
  const duration = (name: string) => actions.get(name)?.getClip().duration ?? 0
  const progress = () => (current ? current.time / current.getClip().duration : 0)
  play(firstClip)

  // starts hidden; fadeTo(1) to show her
  let fade = 0
  let fadeGoal = 0
  let fadeRate = 1
  splat.opacity = 0
  root.visible = false
  const fadeTo = (target: number, seconds = 0.4) => {
    fadeGoal = target
    fadeRate = 1 / Math.max(seconds, 0.001)
  }

  const update = (delta: number) => {
    const step = Math.min(delta, 0.05)
    if (fade !== fadeGoal) {
      fade = fadeGoal > fade ? Math.min(fadeGoal, fade + step * fadeRate) : Math.max(fadeGoal, fade - step * fadeRate)
      splat.opacity = fade
      root.visible = fade > 0
    }
    if (!root.visible) return
    mixer.update(step)
    // clips keep their own travel (a walk really walks); place root where the clip should start
    syncSplat()
  }

  const dispose = () => {
    mixer.stopAllAction()
    splat.dispose()
    skinning.skinTexture.dispose()
    skinning.boneTexture.dispose()
    rig.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry.dispose()
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) mat.dispose()
    })
    root.removeFromParent()
    spark.removeFromParent()
    spark.dispose()
  }

  return { root, spark, play, duration, progress, trimClip, fadeTo, opacity: () => fade, update, dispose }
}
