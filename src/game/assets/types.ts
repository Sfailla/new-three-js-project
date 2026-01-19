export type AssetId = string

export type TextureAsset = {
    id: AssetId
    url: string
}

export type GltfAsset = {
    id: AssetId
    url: string
}

export type AudioAsset = {
    id: AssetId
    url: string
}

export type AssetManifest = {
    textures?: TextureAsset[]
    gltfs?: GltfAsset[]
    audio?: AudioAsset[]
}

export type AssetEvents = {
    'assets:start': {
        itemsTotal: number
    }
    'assets:progress': {
        /** 0..1 */
        progress: number
        itemsLoaded: number
        itemsTotal: number
        /** URL of the item that just progressed (when provided by Three) */
        url?: string
    }
    'assets:ready': {
        itemsLoaded: number
        itemsTotal: number
    }
    'assets:error': {
        url: string
        error?: unknown
    }
}
