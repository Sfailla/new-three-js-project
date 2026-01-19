import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function createLoaders(loadingManager?: THREE.LoadingManager) {
    const textureLoader = new THREE.TextureLoader(loadingManager)
    const audioLoader = new THREE.AudioLoader(loadingManager)

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')

    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.setDRACOLoader(dracoLoader)

    return { textureLoader, audioLoader, dracoLoader, gltfLoader }
}
