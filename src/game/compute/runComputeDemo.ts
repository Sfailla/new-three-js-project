import { Fn, attributeArray, instanceIndex } from 'three/tsl'
import type { WebGPURenderer } from 'three/webgpu'

export async function runComputeDemo(renderer: WebGPURenderer) {
    const count = 256

    // Storage buffer (GPU-writable) holding `count` floats.
    const out = attributeArray(count, 'float')

    // Simple compute: out[i] = i * 2
    const computeNode = Fn(() => {
        const i = instanceIndex
        out.element(i).assign(i.toFloat().mul(2))
    })().compute(count, [64])

    await renderer.computeAsync(computeNode)

    // Read back results for verification (GPU -> CPU).
    const attribute = (out as any).value as unknown
    const arrayBuffer = await renderer.getArrayBufferAsync(attribute as any)
    const result = new Float32Array(arrayBuffer)

    return {
        count,
        result
    }
}
