import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { WebGPURenderer } from 'three/webgpu'
import MeshGridMaterial, { MeshGridMaterialLine } from './materials/mesh-grid-material'

// const { Fn, If, float, hash, instancedArray, instanceIndex, positionLocal, uniform, vec2, vec3 } =
//     TSL as any

// Debug
const debugObject: { clearColor: string } = { clearColor: '#000000' }
const gui = new GUI({ width: 250 })

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

// Simple lighting so MeshStandardMaterial with vertex colors is visible
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
dirLight.position.set(5, 10, 7.5)
scene.add(dirLight)

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const lines: MeshGridMaterialLine[] = [
    new MeshGridMaterialLine(0x705df2, 1, 0.03, 0.2),
    new MeshGridMaterialLine(0xffffff, 10, 0.003, 1)
]

const uvGridMaterial: MeshGridMaterial = new MeshGridMaterial({
    color: 0x1b191f,
    scale: 0.001,
    antialiased: true,
    reference: 'uv',
    lines
})

const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10)
planeGeometry.rotateX(-Math.PI / 2)

// Grid mesh using the UV grid material
const gridMesh = new THREE.Mesh(planeGeometry, uvGridMaterial as unknown as THREE.Material)
gridMesh.position.y = 0

scene.add(gridMesh)

/**
 * Sizes
 */
const sizes = { width: window.innerWidth, height: window.innerHeight }

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 5, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 0, 0)

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(sizes.width, sizes.height)
})

/**
 * Renderer
 */
const renderer = new WebGPURenderer({ canvas, antialias: true })

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.8

// Initialize WebGPU renderer
await renderer.init()

// Run GPU init for leaves now that the renderer is initialized.
// await renderer.computeAsync()

// Animation loop
const clock = new THREE.Clock()
/**
 * Animation loop function that runs on every frame.
 *
 * Responsibilities:
 * - Calculates delta time for frame-independent movement
 * - Updates orbit controls with damping
 * - Processes keyboard input for car movement (forward/back/left/right)
 * - Updates car state (position, rotation, wheel spin) based on input
 * - Maintains constant ride height (y = 1.5) to prevent ground clipping
 * - Syncs kinematic physics body transform with visual car state
 * - Steps the physics simulation forward
 * - Synchronizes Three.js meshes with their corresponding Rapier physics bodies
 * - Updates wheel visual positions and rotations relative to chassis
 * - Renders the scene
 * - Schedules itself for the next frame via requestAnimationFrame
 *
 */
const gameLoop = () => {
    const deltaTime = clock.getDelta()
    console.log({ deltaTime })

    // Render
    renderer.render(scene, camera)

    // Call gameLoop again on the next frame
    window.requestAnimationFrame(gameLoop)
}

gameLoop()
