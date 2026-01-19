import * as THREE from 'three'
import type { Sizes } from './Sizes'

export function createCamera(sizes: Sizes) {
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 5, 10)
    return camera
}
