import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
    root: '.',
    publicDir: 'static',
    plugins: [topLevelAwait(), glsl()],
    server: {
        host: true,
        open: true,
        // If filesystem events are unreliable (network drives, editors using atomic save),
        // enable polling so Vite reliably detects file changes.
        watch: {
            usePolling: true,
            interval: 100
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true
    }
})
