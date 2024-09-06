import {Composite, Engine, Render} from 'matter-js'
import {createCanvas} from '@napi-rs/canvas'
import core from '@actions/core'
import fs from 'fs'
import path from 'path'
import {getCalendar} from '../github/calendar'
import {castCanvas} from '../utils/cast'
import {
  backgroundColor,
  debug,
  FRAME_RATE,
  HEIGHT,
  maxTotalFrames,
  WIDTH
} from './const'
import {drawCalendar} from './calendar'
import {isWorldStopped, maxWorldSpeed} from './utils'
import {drawText, loadFont, useFont} from './text'
import {setBounds} from './bounds'
import {EncoderType, loadEncoder} from './encoder'
import {ContributionShape} from './type/shape'

interface renderOptions {
  token: string
  login: string
  name?: string
  output: string
  font: string
  type: EncoderType
  shape: ContributionShape
}

export async function renderAnimatedGif(options: renderOptions): Promise<void> {
  core.info('Fetching calendar data...')
  const [githubName, weeks] = await getCalendar(options.login, options.token)
  core.info('Calendar data fetched.')

  let name = githubName
  if (options.name) {
    name = options.name
  }

  const img = createCanvas(WIDTH, HEIGHT)
  const ctx = img.getContext('2d')
  const engine = Engine.create()

  await loadFont(options.font)

  setBounds(engine.world)
  drawText(engine.world, name)
  drawCalendar(engine.world, weeks, options.shape)

  const encoder = loadEncoder(options.type)

  await encoder.init()

  const render = Render.create({
    canvas: img as unknown as HTMLCanvasElement,
    engine,
    options: {
      width: WIDTH,
      height: HEIGHT,
      wireframes: debug,
      background: undefined,
      showDebug: debug
    }
  })

  core.info(`Rendering max ${maxTotalFrames} frames...`)

  for (let i = 0; i < maxTotalFrames; i++) {
    if ((i + 1) % 20 === 0) {
      core.info(`Rendered ${i + 1} frames.`)
    }

    Engine.update(engine, 1000 / FRAME_RATE)

    // reset the canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // @ts-expect-error
    Render.bodies(render, Composite.allBodies(engine.world), ctx)

    if (debug) {
      useFont().draw(castCanvas(ctx), `frame: ${i + 1}`, 10, 10, 12)

      const [speed, angularSpeed] = maxWorldSpeed(engine.world)

      useFont().draw(castCanvas(ctx), `speed: ${speed.toFixed(3)}`, 10, 30, 12)
      useFont().draw(
        castCanvas(ctx),
        `angular speed: ${angularSpeed.toFixed(3)}`,
        10,
        50,
        12
      )

      fs.writeFileSync(`tmp/debug-${i}.png`, img.toBuffer('image/png'))
    }

    await encoder.onFrame(ctx, i)

    if (i > 30 && isWorldStopped(engine.world)) {
      core.info(`World stopped at frame ${i + 1}. Stopping render.`)
      break
    }
  }

  core.info('Render finished.')
  core.info('Compressing...')

  // create the output folder
  fs.mkdirSync(path.dirname(options.output), {recursive: true})

  await encoder.finalize(options.output, options.type === 'both')

  core.info(`Compressed file ${options.output} written.`)
}
