import * as THREE from 'three'
import { WebGPURenderer } from 'three/webgpu'
import type { Sizes } from './Sizes'

/**
 * Creates and initializes a WebGPU renderer with specified canvas and size configuration.
 *
 * @param options - Configuration object for renderer creation
 * @param options.canvas - The HTML canvas element to render to
 * @param options.sizes - Size configuration object containing width, height, and pixelRatio
 * @returns A promise that resolves to an initialized WebGPURenderer instance
 *
 * @remarks
 * - MSAA is disabled in favor of capped device pixel ratio for better performance in WebGPU
 * - The renderer is configured with ACES Filmic tone mapping and an exposure of 0.8
 * - The renderer must be initialized before being returned
 */
export async function createRenderer({
    canvas,
    sizes
}: {
    canvas: HTMLCanvasElement
    sizes: Sizes
}): Promise<WebGPURenderer> {
    const renderer = new WebGPURenderer({ canvas, antialias: false })

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
    renderer.setClearColor(0x0b0b10)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.8

    await renderer.init()

    return renderer
}
