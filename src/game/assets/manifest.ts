import type { AssetManifest } from './types'

/**
 * Start empty so the boilerplate runs even before you add files.
 *
 * Put your exported Blender levels and assets under `static/assets/...`
 * and reference them here with URLs like `/assets/levels/level-01.glb`.
 */
export const manifest: AssetManifest = {
    textures: [],
    gltfs: [],
    audio: []

    // Example:
    // gltfs: [{ id: 'level-01', url: '/assets/levels/level-01.glb' }],
    // textures: [{ id: 'noise', url: '/assets/textures/noise.png' }],
    // audio: [{ id: 'music', url: '/assets/audio/ambient.ogg' }]
}
