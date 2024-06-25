import {Encoder} from './types'
import {FRAME_RATE, HEIGHT, WIDTH} from '../const'
import fs from 'fs'
import {gifsicle} from '../../utils/bins'
import {
  type Encoder as GIFEncoder,
  GIFEncoder as create,
  quantize,
  applyPalette
} from 'gifenc'
import {type SKRSContext2D} from '@napi-rs/canvas'

export class GifEncoder implements Encoder {
  tmp: GIFEncoder

  async finalize(target: string, appendExt: boolean = false): Promise<void> {
    this.tmp.finish()

    if (appendExt) {
      target += '.gif'
    }

    await fs.promises.writeFile(target, Buffer.from(this.tmp.bytes()))

    const process = await gifsicle.run(
      '--optimize=3',
      '--colors',
      '16',
      '--no-loopcount',
      '--batch',
      '--interlace',
      target
    )

    if (process.failed) {
      throw new Error(`Failed to encode gif:\n${process.stderr}`)
    }
  }

  async init(): Promise<void> {
    this.tmp = create({
      auto: true
    })
  }

  async onFrame(ctx: SKRSContext2D): Promise<void> {
    // Get the image data from the context
    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)

    const palette = quantize(new Uint8Array(imageData.data.buffer), 256)

    const index = applyPalette(new Uint8Array(imageData.data.buffer), palette)

    this.tmp.writeFrame(index, WIDTH, HEIGHT, {
      palette,
      delay: Math.round(1000 / FRAME_RATE)
    })
  }
}
