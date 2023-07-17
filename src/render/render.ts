import {getCalendar} from '../github/calendar'
import Matter, {Bodies, Composite, Engine, Svg, Vector, World} from 'matter-js'
import TextToSVG, {GenerationOptions} from 'text-to-svg'
import GIFEncoder from "gif-encoder-2";
import { CanvasRenderingContext2D, createCanvas } from "canvas";

const WIDTH = 800
const HEIGHT = 400

const PIC_TIME = 6

const xOffset = 40
const yOffset = -80
const xMargin = 4
const yMargin = 4

const totalFrames = 60 * PIC_TIME

export async function renderAnimatedGif(token: string): Promise<void> {
  const [name, weeks] = await getCalendar(token)

  const img = createCanvas(WIDTH, HEIGHT)
  const ctx = img.getContext('2d')

  const engine = Engine.create()

  const ground = Bodies.rectangle(400, 410, 810, 20, {isStatic: true})
  const left = Bodies.rectangle(-10, 200, 20, 400, {isStatic: true})
  const right = Bodies.rectangle(810, 200, 20, 400, {isStatic: true})
  World.add(engine.world, [ground, left, right])


  const fonts: Vector[][] = []



  World.add(
    engine.world,
    Bodies.fromVertices(380, 120, fonts, {
      isStatic: true,
      render: {
        fillStyle: 'fafafa'
      }
    })
  )

  const squares: Array<Matter.Body> = []

  for (let i = 0; i < weeks.length; i++) {
    for (let j = 0; j < weeks[i].contributionDays.length; j++) {
      const day = weeks[i].contributionDays[j]

      const x = xOffset + i * 10 + (i - 1) * xMargin
      const y = yOffset + j * 10 + (j - 1) * yMargin
      const square = Bodies.rectangle(x, y, 10, 10, {
        render: {
          fillStyle: day.color
        },
        density: 20
      })

      squares.push(square)
    }
  }

  World.add(engine.world, squares)

  const gif = new GIFEncoder(WIDTH, HEIGHT, 'neuquant', true, totalFrames)

  gif.setFrameRate(60)
  gif.start()

  for (let i = 0; i < totalFrames; i++) {
    Engine.update(engine, 1000 / 60)
    render(engine, ctx)
    gif.addFrame(ctx)
  }

  gif.finish()

  // write to a.gif
  const fs = require('fs')
  const buffer = gif.out.getData()
  fs.writeFileSync('a.gif', buffer)
}

function render(engine: Engine, context: CanvasRenderingContext2D) {
  const bodies = Composite.allBodies(engine.world)

  context.fillStyle = '#fff'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.beginPath()

  for (let i = 0; i < bodies.length; i += 1) {
    const vertices = bodies[i].vertices

    context.moveTo(vertices[0].x, vertices[0].y)

    for (let j = 1; j < vertices.length; j += 1) {
      context.lineTo(vertices[j].x, vertices[j].y)
    }

    context.lineTo(vertices[0].x, vertices[0].y)
  }

  context.lineWidth = 1
  context.strokeStyle = 'rgba(255,255,255,0.2)'
  context.stroke()
}


