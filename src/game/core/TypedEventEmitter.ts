export type Unsubscribe = () => void

/**
 * Minimal typed event emitter.
 *
 * Events is a map of eventName -> payload type.
 */
export class TypedEventEmitter<Events extends Record<string, unknown>> {
    private listeners = new Map<keyof Events, Set<(payload: any) => void>>()

    on<K extends keyof Events>(eventName: K, callback: (payload: Events[K]) => void): Unsubscribe {
        const set = this.listeners.get(eventName) ?? new Set()
        set.add(callback as any)
        this.listeners.set(eventName, set)

        return () => this.off(eventName, callback)
    }

    off<K extends keyof Events>(eventName: K, callback: (payload: Events[K]) => void) {
        const set = this.listeners.get(eventName)
        if (!set) return
        set.delete(callback as any)
        if (set.size === 0) this.listeners.delete(eventName)
    }

    emit<K extends keyof Events>(eventName: K, payload: Events[K]) {
        const set = this.listeners.get(eventName)
        console.log({ set })
        if (!set) return
        for (const callback of set) callback(payload)
    }

    clear() {
        this.listeners.clear()
    }
}
