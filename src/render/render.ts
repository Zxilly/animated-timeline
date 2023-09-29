import {getCalendar} from '../github/calendar'
import Matter, {
  Bodies,
  Common,
  Composite,
  Engine,
  Render,
  Vector,
  World
} from 'matter-js'
import GIFEncoder from 'gif-encoder-2'
import {createCanvas} from 'canvas'
import {parse} from 'opentype.js'
import * as fs from 'fs'
// @ts-ignore
import fromVertices from '../utils/bodies.js'

const WIDTH = 1200
const HEIGHT = 500

const PIC_TIME = 6

const xMargin = 4
const yMargin = 4

const boxSize = 15

const totalFrames = 60 * PIC_TIME

export async function renderAnimatedGif(token: string): Promise<void> {
  const [name, weeks] = await getCalendar(token)

  const xOffset =
    WIDTH / 2 - (weeks.length / 2) * boxSize - (weeks.length / 2 - 1) * xMargin
  const yOffset = -160

  const img = createCanvas(WIDTH, HEIGHT)
  console.log(img.width, img.height)
  const ctx = img.getContext('2d')

  const font = parse(fs.readFileSync(`./font/NotoSerifSC-Regular.otf`).buffer)
  console.log(font.getEnglishName('fontFamily'))

  const engine = Engine.create()

  const ground = Bodies.rectangle(
    WIDTH / 2,
    HEIGHT + boxSize,
    WIDTH + boxSize,
    boxSize * 2,
    {isStatic: true}
  )
  const left = Bodies.rectangle(-boxSize, HEIGHT / 2, boxSize * 2, HEIGHT, {
    isStatic: true
  })
  const right = Bodies.rectangle(
    WIDTH + boxSize,
    HEIGHT / 2,
    boxSize * 2,
    HEIGHT,
    {isStatic: true}
  )
  World.add(engine.world, [ground, left, right])

  Common.setDecomp(require('poly-decomp'))

  const text: Array<Array<Vector>> = []

  font.getPaths(name, WIDTH / 2, HEIGHT / 2, 144).forEach(path => {
    const cmds = path.commands
    let points: Array<Vector> = []
    for (let cmd of cmds) {
      switch (cmd.type) {
        case 'M':
        case 'L':
          points.push(Vector.create(cmd.x, cmd.y))
          break
        case 'Q':
          points.push(Vector.create((cmd.x1 + cmd.x) / 2, (cmd.y1 + cmd.y) / 2))
          break
        case 'C':
          points.push(
            Vector.create(
              (cmd.x1 + cmd.x2 + cmd.x) / 3,
              (cmd.y1 + cmd.y2 + cmd.y) / 3
            )
          )
          break
        case 'Z':
          if (points.length > 0) {
            text.push(points)
            points = []
          }
      }
    }
  })

  World.add(
    engine.world,
    fromVertices(WIDTH / 2, HEIGHT / 2, text, {
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
      if (day.contributionCount === 0) continue

      let density = 0
      switch (day.contributionLevel) {
        case 'FIRST_QUARTILE':
          density = 4
          break
        case 'SECOND_QUARTILE':
          density = 8
          break
        case 'THIRD_QUARTILE':
          density = 12
          break
        case 'FOURTH_QUARTILE':
          density = 16
          break
      }

      const x = xOffset + i * boxSize + (i - 1) * xMargin
      const y = yOffset + j * boxSize + (j - 1) * yMargin
      const square = Bodies.rectangle(x, y, boxSize, boxSize, {
        render: {
          fillStyle: day.color
        },
        density: density
      })

      squares.push(square)
    }
  }

  World.add(engine.world, squares)

  const gif = new GIFEncoder(WIDTH, HEIGHT, 'neuquant', false, totalFrames)

  gif.setFrameRate(60)
  gif.start()

  // todo: remove debug output
  // remove all in tmp
  fs.readdirSync('./tmp').forEach(file => {
    fs.unlinkSync(`./tmp/${file}`)
  })

  const render = Render.create({
    // @ts-ignore
    canvas: img,
    engine: engine,
    options: {
      width: WIDTH,
      height: HEIGHT,
      wireframes: false,
      wireframeBackground: undefined,
      background: undefined
    }
  })

  for (let i = 0; i < totalFrames; i++) {
    Engine.update(engine, 1000 / 60)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // @ts-ignore
    Render.bodies(render, Composite.allBodies(engine.world), ctx)

    const buffer = img.toBuffer('image/png')
    fs.writeFileSync(`./tmp/${i}.png`, buffer)

    gif.addFrame(ctx)

    console.log(`frame ${i} done`)
  }

  gif.finish()

  const buffer = gif.out.getData()
  fs.writeFileSync('a.gif', buffer)
}
