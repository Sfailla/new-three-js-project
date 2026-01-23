import { Game } from './game'

// Grab the canvas safely (avoid `as HTMLCanvasElement` hiding null).
const canvasEl = document.querySelector('canvas.webgl')

if (!(canvasEl instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element ".webgl" was not found in the DOM.')
}

// IMPORTANT (DEV/HMR): Browsers only allow *one* context type per canvas.
// If a previous run created a `webgpu` or `webgl/webgl2` context on this canvas,
// then creating a new renderer on the same canvas can fail and return a null WebGL context.
// That can show up as: "Cannot read properties of null (reading 'getSupportedExtensions')".
//
// A simple fix is to replace the canvas with a fresh clone in development.
let canvas = canvasEl
if (import.meta.env.DEV) {
    const freshCanvas = canvas.cloneNode(false) as HTMLCanvasElement
    canvas.replaceWith(freshCanvas)
    canvas = freshCanvas
}

const loadingEl = document.getElementById('loading')
const loadingTextEl = document.querySelector('#loading .loading__text')
const loadingFillEl = document.querySelector('#loading .loading__barFill') as HTMLElement | null

const app = Game.create({ canvas })

app.assets.events.on('assets:progress', ({ progress, itemsLoaded, itemsTotal }) => {
    const pct = Math.round(progress * 100)
    if (loadingTextEl)
        loadingTextEl.textContent =
            itemsTotal === 0 ? 'Ready' : `${pct}% (${itemsLoaded}/${itemsTotal})`
    if (loadingFillEl) loadingFillEl.style.width = `${pct}%`
})

app.assets.events.on('assets:ready', () => {
    loadingEl?.classList.add('hidden')
})

await app.init()

app.start()

// Hot Module Replacement (HMR) - Remove this snippet for production
if (import.meta.hot) {
    import.meta.hot.dispose(() => app.destroy())
}
