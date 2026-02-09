import * as THREE from 'three'

export type WorldLights = {
    ambient: THREE.AmbientLight
    directional: THREE.DirectionalLight
    dispose: () => void
}

export function createLights(scene: THREE.Scene): WorldLights {
    const ambient = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambient)

    const directional = new THREE.DirectionalLight(0xffffff, 1.0)
    directional.position.set(10, 20, 10)
    scene.add(directional)

    return {
        ambient,
        directional,
        dispose() {
            scene.remove(ambient)
            scene.remove(directional)
        }
    }
}
