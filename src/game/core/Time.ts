export type TickCallback = (deltaSeconds: number, elapsedSeconds: number) => void

export class Time {
    private tickCallbacks = new Set<TickCallback>()

    private gameloop: number | null = null
    private lastTimeMs: number | null = null
    private elapsedMs = 0

    onTick(cb: TickCallback) {
        this.tickCallbacks.add(cb)
        return () => this.tickCallbacks.delete(cb)
    }

    start() {
        if (this.gameloop !== null) return
        this.lastTimeMs = null
        this.elapsedMs = 0
        this.gameloop = window.requestAnimationFrame(this.loop)
    }

    stop() {
        if (this.gameloop === null) return
        window.cancelAnimationFrame(this.gameloop)
        this.gameloop = null
        this.lastTimeMs = null
    }

    destroy() {
        this.stop()
        this.tickCallbacks.clear()
    }

    private loop = (nowMs: number) => {
        if (this.lastTimeMs === null) this.lastTimeMs = nowMs

        const deltaMs = nowMs - this.lastTimeMs
        this.lastTimeMs = nowMs

        this.elapsedMs += deltaMs

        const deltaSeconds = deltaMs / 1000
        const elapsedSeconds = this.elapsedMs / 1000

        for (const cb of this.tickCallbacks) cb(deltaSeconds, elapsedSeconds)

        this.gameloop = window.requestAnimationFrame(this.loop)
    }
}
