import * as THREE from 'three'
import MeshGridMaterial, { MeshGridMaterialLine } from '../../materials/mesh-grid-material'

export type World = {
    dispose: () => void
}

export function createWorld(scene: THREE.Scene): World {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 10, 7.5)
    scene.add(dirLight)

    const lines: MeshGridMaterialLine[] = [
        new MeshGridMaterialLine(0x705df2, 1, 0.03, 0.2),
        new MeshGridMaterialLine(0xffffff, 10, 0.003, 1)
    ]

    const uvGridMaterial: MeshGridMaterial = new MeshGridMaterial({
        color: 0x1b191f,
        scale: 0.001,
        antialiased: true,
        reference: 'uv',
        lines
    })

    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10)
    planeGeometry.rotateX(-Math.PI / 2)

    const gridMesh = new THREE.Mesh(planeGeometry, uvGridMaterial as unknown as THREE.Material)
    gridMesh.position.y = 0
    scene.add(gridMesh)

    return {
        dispose() {
            scene.remove(gridMesh)
            scene.remove(ambientLight)
            scene.remove(dirLight)

            planeGeometry.dispose()
            ;(gridMesh.material as THREE.Material).dispose()
        }
    }
}
