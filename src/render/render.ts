/* eslint-disable @typescript-eslint/ban-ts-comment */

import { getCalendar } from '../github/calendar'
import Matter, {
  Bodies,
  Bounds,
  Common,
  Composite,
  Engine,
  Render,
  Vector,
  World
} from 'matter-js'
import GIFEncoder from 'gif-encoder-2'
import { createCanvas } from 'canvas'
import { parse } from 'opentype.js'
import * as fs from 'fs'
// @ts-ignore
import fromVertices from '../utils/bodies'
import polyDecomp from 'poly-decomp'
import sharp from 'sharp'
import * as core from '@actions/core'
import * as path from 'path'
// @ts-ignore
import fontBin from '../../font/NotoSerifSC-Regular.otf'
import { execFileSync } from 'child_process'

const WIDTH = 1200
const HEIGHT = 500

const PIC_TIME = 6

const xMargin = 4
const yMargin = 4

const boxSize = 15

const totalFrames = 60 * PIC_TIME

interface renderOptions {
  token: string
  name?: string
  output: string
  type: 'webp' | 'gif'
}

export async function renderAnimatedGif(options: renderOptions): Promise<void> {
  core.info('Fetching calendar data...')
  const [githubName, weeks] = await getCalendar(options.token)
  core.info('Calendar data fetched.')

  let name = githubName
  if (options.name) {
    name = options.name
  }

  const xOffset =
    WIDTH / 2 - (weeks.length / 2) * boxSize - (weeks.length / 2 - 1) * xMargin
  const yOffset = -160

  const font = parse(fontBin.buffer)

  const img = createCanvas(WIDTH, HEIGHT)

  const ctx = img.getContext('2d')

  const engine = Engine.create()

  const ground = Bodies.rectangle(
    WIDTH / 2,
    HEIGHT + boxSize,
    WIDTH + boxSize,
    boxSize * 2,
    {
      isStatic: true,
      render: {
        fillStyle: 'white'
      }
    }
  )
  const left = Bodies.rectangle(-boxSize, HEIGHT / 2, boxSize * 2, HEIGHT, {
    isStatic: true,
    render: {
      fillStyle: 'white'
    }
  })
  const right = Bodies.rectangle(
    WIDTH + boxSize,
    HEIGHT / 2,
    boxSize * 2,
    HEIGHT,
    {
      isStatic: true,
      render: {
        fillStyle: 'white'
      },
    }
  )
  World.add(engine.world, [ground, left, right])

  Common.setDecomp(polyDecomp)

  const text: Vector[][] = []

  const paths = font.getPaths(name, WIDTH / 2, HEIGHT / 2, 144)

  for (const pa of paths) {
    const cmds = pa.commands
    let points: Vector[] = []
    for (const cmd of cmds) {
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
  }

  const textBodies = fromVertices(WIDTH / 2, HEIGHT / 2, text, {
    isStatic: true,
    render: {
      fillStyle: 'white'
    }
  })

  const textComp = Composite.create({
    bodies: textBodies
  })

  // @ts-ignore
  const textBound: Bounds = Composite.bounds(textComp)

  World.add(engine.world, textComp)

  const squares: Matter.Body[] = []

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
        density
      })

      squares.push(square)
    }
  }

  World.add(engine.world, squares)

  const gif = new GIFEncoder(WIDTH, HEIGHT, 'neuquant', false, totalFrames)

  gif.setFrameRate(60)
  gif.start()

  const render = Render.create({
    // @ts-ignore
    canvas: img,
    engine,
    options: {
      width: WIDTH,
      height: HEIGHT,
      wireframes: false,
      wireframeBackground: undefined,
      background: undefined
    }
  })

  const fontPathBound = font
    .getPath(name, WIDTH / 2, HEIGHT / 2, 144)
    .getBoundingBox()

  const shapeCenterX = (textBound.max.x + textBound.min.x) / 2
  const shapeCenterY = (textBound.max.y + textBound.min.y) / 2

  const fontCenterX = (fontPathBound.x2 + fontPathBound.x1) / 2
  const fontCenterY = (fontPathBound.y2 + fontPathBound.y1) / 2

  core.info(`Rendering ${totalFrames} frames...`)

  for (let i = 0; i < totalFrames; i++) {
    if ((i + 1) % 20 === 0) {
      core.info(`Rendered ${i + 1} frames.`)
    }

    Engine.update(engine, 1000 / 60)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // @ts-ignore
    Render.bodies(render, Composite.allBodies(engine.world), ctx)

    font.draw(
      // @ts-ignore
      ctx,
      name,
      WIDTH / 2 - (fontCenterX - shapeCenterX),
      HEIGHT / 2 - (fontCenterY - shapeCenterY),
      144
    )

    gif.addFrame(ctx)
  }

  gif.finish()

  core.info('Render finished.')
  core.info('Reducing output size...')

  const buffer = gif.out.getData()

  // create the folder
  fs.mkdirSync(path.dirname(options.output), { recursive: true })

  if (options.type === 'webp') {
    await sharp(buffer, {
      animated: true
    })
      .webp({
        delay: Math.floor(1000 / 60),
        loop: 1,
        quality: 60,
        nearLossless: true,
        effort: 6,
        // @ts-ignore
        minSize: true,
        alphaQuality: 0,
        mixed: true
      })
      .toFile(options.output)
  } else {
    fs.writeFileSync(options.output, buffer)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const gifsiclePath = await new Promise<string>(resolve => {
      eval(`
        import("gifsicle").then((gifsicle) => {
          resolve(gifsicle.default);
        });
      `)
    })
    core.debug(`gifsicle path: ${gifsiclePath}`)

    execFileSync(gifsiclePath, [
      '--optimize=2',
      '--colors',
      '16',
      '--no-loopcount',
      '--batch',
      '--interlace',
      options.output
    ])
  }

  core.info('File written.')
}
