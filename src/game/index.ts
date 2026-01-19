import type * as THREE from 'three'
import type { WebGPURenderer } from 'three/webgpu'
import { createCamera } from './core/createCamera'
import { createControls } from './core/createControls'
import { createRenderer } from './core/createRenderer'
import { createScene } from './core/createScene'
import { Sizes } from './core/Sizes'
import { Time } from './core/Time'
import { createDebug } from './debug/Debug'
import { createLoaders } from './loaders/createLoaders'
import { createWorld } from './world/createWorld'

export class Game {
    static async create({ canvas }: { canvas: HTMLCanvasElement }) {
        const game = new Game({ canvas })
        await game.init()
        return game
    }

    private readonly canvas: HTMLCanvasElement

    private readonly debug = createDebug()
    private readonly sizes = new Sizes()
    private readonly time = new Time()

    private readonly scene: THREE.Scene
    private readonly camera: THREE.PerspectiveCamera
    private readonly controls: ReturnType<typeof createControls>

    private renderer: WebGPURenderer | null = null

    private readonly loaders = createLoaders()
    private readonly world: ReturnType<typeof createWorld>

    private unsubscribeResize: (() => void) | null = null
    private unsubscribeTick: (() => void) | null = null

    private constructor({ canvas }: { canvas: HTMLCanvasElement }) {
        this.canvas = canvas

        this.scene = createScene()
        this.camera = createCamera(this.sizes)
        this.scene.add(this.camera)

        this.controls = createControls(this.camera, this.canvas)

        this.world = createWorld(this.scene)

        // Avoid unused warning but keep loaders ready for later features.
        void this.loaders
    }

    private async init() {
        this.renderer = await createRenderer({ canvas: this.canvas, sizes: this.sizes })

        this.unsubscribeResize = this.sizes.onResize(() => this.resize())
        this.unsubscribeTick = this.time.onTick(deltaSeconds => this.tick(deltaSeconds))

        this.resize()
    }

    start() {
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

        this.world.dispose()
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
