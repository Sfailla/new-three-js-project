import type * as THREE from 'three'
import type { WebGPURenderer } from 'three/webgpu'
import { Assets } from './assets/Assets'
import { manifest } from './assets/manifest'
import { createCamera } from './core/createCamera'
import { createControls } from './core/createControls'
import { createRenderer } from './core/createRenderer'
import { createScene } from './core/createScene'
import { Sizes } from './core/Sizes'
import { Time } from './core/Time'
import { createDebug } from './debug/Debug'
import { createWorld } from './world/createWorld'

type Canvas = { canvas: HTMLCanvasElement }

export class Game {
    static create({ canvas }: Canvas) {
        return new Game({ canvas })
    }

    private readonly canvas: HTMLCanvasElement

    private readonly debug = createDebug()
    private readonly sizes = new Sizes()
    private readonly time = new Time()
    readonly assets = new Assets()

    private readonly scene: THREE.Scene
    private readonly camera: THREE.PerspectiveCamera
    private readonly controls: ReturnType<typeof createControls>

    private renderer: WebGPURenderer | null = null

    private world: ReturnType<typeof createWorld> | null = null

    private unsubscribeResize: (() => void) | null = null
    private unsubscribeTick: (() => void) | null = null

    private initialized = false

    private constructor({ canvas }: Canvas) {
        this.canvas = canvas

        this.scene = createScene()
        this.camera = createCamera(this.sizes)
        this.scene.add(this.camera)

        this.controls = createControls(this.camera, this.canvas)
    }

    async init() {
        if (this.initialized) return

        // Load all registered assets before creating the world.
        // This is the "ready boundary" so nothing tries to use assets early.
        await this.assets.load(manifest)

        this.world = createWorld(this.scene)

        this.renderer = await createRenderer({ canvas: this.canvas, sizes: this.sizes })

        this.unsubscribeResize = this.sizes.onResize(() => this.resize())
        this.unsubscribeTick = this.time.onTick(deltaSeconds => this.tick(deltaSeconds))

        this.resize()

        this.initialized = true
    }

    start() {
        if (!this.initialized) {
            throw new Error('Game not initialized. Call await game.init() before start().')
        }
        this.time.start()
    }

    stop() {
        this.time.stop()
    }

    destroy() {
        this.stop()

        this.unsubscribeTick?.()
        this.unsubscribeTick = null

        this.unsubscribeResize?.()
        this.unsubscribeResize = null

        this.world?.dispose()
        this.world = null

        this.assets.dispose()
        this.debug.destroy()
        this.sizes.destroy()
        this.time.destroy()

        this.renderer?.dispose()
        this.renderer = null
    }

    private resize() {
        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        if (!this.renderer) return

        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(this.sizes.pixelRatio)
    }

    private tick(_deltaSeconds: number) {
        this.controls.update()

        if (!this.renderer) return
        this.renderer.render(this.scene, this.camera)
    }
}
