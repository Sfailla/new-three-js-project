import type { WebGPURenderer } from 'three/webgpu'

export type StatsGlOverlay = {
    dom: HTMLElement
    begin: () => void
    end: () => void
    update: () => void
    destroy: () => void
}

export async function createStatsGlOverlay({
    renderer
}: {
    renderer?: WebGPURenderer
} = {}): Promise<StatsGlOverlay> {
    const mod = await import('stats-gl')
    const Stats = mod.default

    const stats = new Stats({
        // Keep this lightweight by default.
        // Turn on GPU once you're happy with baseline perf.
        trackFPS: true,
        trackGPU: true,
        trackHz: false,
        trackCPT: false,
        minimal: false,
        horizontal: true
    })

    let initPatchedRenderer = false

    // If a three renderer is provided, stats-gl can patch it.
    // This lets stats-gl wrap render calls without us calling begin()/end().
    if (renderer && typeof (stats as any).init === 'function') {
        try {
            ;(stats as any).init(renderer)
            initPatchedRenderer = true
        } catch (err) {
            // Non-fatal: we'll still show the FPS/CPU panels.
            console.warn('[stats-gl] init(renderer) failed; continuing without renderer patch', err)
        }
    }

    // Helpful hint: GPU timings require WebGL timer queries or WebGPU timestamp-query.
    // Having a physical GPU is not enough; the browser must expose timing queries.
    if (renderer) {
        const device =
            (renderer as any)?.backend?.device ??
            (renderer as any)?.getContext?.()?.device ??
            (renderer as any)?.context?.device

        const hasTimestampQuery = !!device?.features?.has?.('timestamp-query')

        if (!hasTimestampQuery) {
            console.warn(
                '[stats-gl] GPU panel shows 0.00 because WebGPU timestamp queries are not available in this browser/device context. ' +
                    'Try Chrome/Edge with WebGPU enabled; some browsers require enabling developer/unsafe WebGPU features for timestamp-query.'
            )
        }
    }

    const dom = (stats as any).dom as HTMLElement
    dom.style.position = 'fixed'
    dom.style.left = '0'
    dom.style.top = '0'
    dom.style.zIndex = '9999'
    dom.style.pointerEvents = 'none'

    document.body.appendChild(dom)

    return {
        dom,
        begin() {
            // If stats-gl patched the renderer via init(renderer), it wraps render calls internally.
            // Calling begin/end in that case can double-wrap and break GPU readings.
            if (initPatchedRenderer) return
            ;(stats as any).begin?.()
        },
        end() {
            if (initPatchedRenderer) return
            ;(stats as any).end?.()
        },
        update() {
            ;(stats as any).update()
        },
        destroy() {
            dom.remove()
        }
    }
}
