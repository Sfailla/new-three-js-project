import { Game } from './game'

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

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
