import * as THREE from 'three'
import { WebGPURenderer } from 'three/webgpu'
import type { Sizes } from './Sizes'

export async function createRenderer({
    canvas,
    sizes
}: {
    canvas: HTMLCanvasElement
    sizes: Sizes
}): Promise<WebGPURenderer> {
    const renderer = new WebGPURenderer({ canvas, antialias: true })

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.8

    await renderer.init()

    return renderer
}
