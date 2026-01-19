import GUI from 'lil-gui'

export type Debug = {
    gui: GUI
    debugObject: {
        clearColor: string
    }
    destroy: () => void
}

export function createDebug(): Debug {
    const debugObject = { clearColor: '#000000' }
    const gui = new GUI({ width: 250 })

    return {
        gui,
        debugObject,
        destroy() {
            gui.destroy()
        }
    }
}
