export type ResizeCallback = (sizes: Sizes) => void

export class Sizes {
    width: number
    height: number
    pixelRatio: number

    private resizeCallbacks = new Set<ResizeCallback>()

    constructor() {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        window.addEventListener('resize', this.handleResize)
    }

    onResize(callback: ResizeCallback) {
        this.resizeCallbacks.add(callback)
        return () => this.resizeCallbacks.delete(callback)
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize)
        this.resizeCallbacks.clear()
    }

    private handleResize = () => {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        for (const callback of this.resizeCallbacks) callback(this)
    }
}
