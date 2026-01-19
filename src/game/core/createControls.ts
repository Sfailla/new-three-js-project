import type * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createControls(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.target.set(0, 0, 0)
    return controls
}
