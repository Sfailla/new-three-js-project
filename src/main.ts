import { Game } from './game'

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

const app = await Game.create({ canvas })

app.start()

// Hot Module Replacement (HMR) - Remove this snippet for production
if (import.meta.hot) {
    import.meta.hot.dispose(() => app.destroy())
}
