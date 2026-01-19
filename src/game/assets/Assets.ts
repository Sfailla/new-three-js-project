import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { TypedEventEmitter } from '../core/TypedEventEmitter'
import { createLoaders } from '../loaders/createLoaders'
import type { AssetEvents, AssetManifest, AudioAsset, GltfAsset, TextureAsset } from './types'

export class Assets {
    readonly events = new TypedEventEmitter<AssetEvents>()

    private readonly loadingManager: THREE.LoadingManager
    private readonly loaders: ReturnType<typeof createLoaders>

    private textures = new Map<string, THREE.Texture>()
    private gltfs = new Map<string, GLTF>()
    private audioBuffers = new Map<string, AudioBuffer>()

    private itemsTotal = 0
    private itemsLoaded = 0
    private isLoading = false
    private isReady = false

    constructor() {
        this.loadingManager = new THREE.LoadingManager()

        this.loadingManager.onStart = (_url, itemsLoaded, itemsTotal) => {
            this.itemsLoaded = itemsLoaded
            this.itemsTotal = itemsTotal
            this.events.emit('assets:start', { itemsTotal })
            this.events.emit('assets:progress', {
                progress: itemsTotal === 0 ? 1 : itemsLoaded / itemsTotal,
                itemsLoaded,
                itemsTotal
            })
        }

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.itemsLoaded = itemsLoaded
            this.itemsTotal = itemsTotal
            this.events.emit('assets:progress', {
                progress: itemsTotal === 0 ? 1 : itemsLoaded / itemsTotal,
                itemsLoaded,
                itemsTotal,
                url
            })
        }

        this.loadingManager.onLoad = () => {
            this.isReady = true
            this.isLoading = false
            this.events.emit('assets:ready', {
                itemsLoaded: this.itemsLoaded,
                itemsTotal: this.itemsTotal
            })
        }

        this.loadingManager.onError = url => {
            // Note: Three doesn't provide the actual error object here.
            this.events.emit('assets:error', { url })
        }

        this.loaders = createLoaders(this.loadingManager)
    }

    async load(manifest: AssetManifest) {
        if (this.isLoading) return
        if (this.isReady) return

        this.isLoading = true

        const textures = manifest.textures ?? []
        const gltfs = manifest.gltfs ?? []
        const audio = manifest.audio ?? []

        this.itemsTotal = textures.length + gltfs.length + audio.length
        this.itemsLoaded = 0

        // With a zero-length manifest, Three won't fire progress callbacks,
        // so we emit a sensible ready boundary ourselves.
        if (this.itemsTotal === 0) {
            this.events.emit('assets:start', { itemsTotal: 0 })
            this.events.emit('assets:progress', {
                progress: 1,
                itemsLoaded: 0,
                itemsTotal: 0
            })
            this.isReady = true
            this.isLoading = false
            this.events.emit('assets:ready', { itemsLoaded: 0, itemsTotal: 0 })
            return
        }

        const tasks: Promise<unknown>[] = []

        for (const asset of textures) tasks.push(this.loadTexture(asset))
        for (const asset of gltfs) tasks.push(this.loadGltf(asset))
        for (const asset of audio) tasks.push(this.loadAudio(asset))

        // Let errors fail fast (professional default); callers can decide
        // whether to retry or show an error screen.
        await Promise.all(tasks)
    }

    getTexture(id: string) {
        const texture = this.textures.get(id)
        if (!texture) throw new Error(`Texture not found: ${id}`)
        return texture
    }

    getGltf(id: string) {
        const gltf = this.gltfs.get(id)
        if (!gltf) throw new Error(`GLTF not found: ${id}`)
        return gltf
    }

    getAudioBuffer(id: string) {
        const buffer = this.audioBuffers.get(id)
        if (!buffer) throw new Error(`Audio buffer not found: ${id}`)
        return buffer
    }

    dispose() {
        for (const texture of this.textures.values()) texture.dispose()
        this.textures.clear()

        this.gltfs.clear()

        this.audioBuffers.clear()

        this.events.clear()

        // DRACOLoader owns a worker pool; clean it up.
        this.loaders.dracoLoader.dispose()
    }

    private loadTexture(asset: TextureAsset) {
        return new Promise<THREE.Texture>((resolve, reject) => {
            this.loaders.textureLoader.load(
                asset.url,
                texture => {
                    this.textures.set(asset.id, texture)
                    resolve(texture)
                },
                undefined,
                error => {
                    this.events.emit('assets:error', { url: asset.url, error })
                    reject(error)
                }
            )
        })
    }

    private loadGltf(asset: GltfAsset) {
        return new Promise<GLTF>((resolve, reject) => {
            this.loaders.gltfLoader.load(
                asset.url,
                gltf => {
                    this.gltfs.set(asset.id, gltf)
                    resolve(gltf)
                },
                undefined,
                error => {
                    this.events.emit('assets:error', { url: asset.url, error })
                    reject(error)
                }
            )
        })
    }

    private loadAudio(asset: AudioAsset) {
        return new Promise<AudioBuffer>((resolve, reject) => {
            this.loaders.audioLoader.load(
                asset.url,
                buffer => {
                    this.audioBuffers.set(asset.id, buffer)
                    resolve(buffer)
                },
                undefined,
                error => {
                    this.events.emit('assets:error', { url: asset.url, error })
                    reject(error)
                }
            )
        })
    }
}
