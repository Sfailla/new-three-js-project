import { Game } from './game/Game'

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

const app = await Game.create({ canvas })

app.start()

if (import.meta.hot) {
    import.meta.hot.dispose(() => app.destroy())
}
