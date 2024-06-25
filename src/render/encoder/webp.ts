import {Encoder} from './types'
import fs from 'fs'
import path from 'path'
import {img2webp} from '../../utils/bins'
import {FRAME_RATE} from '../const'
import {type SKRSContext2D} from '@napi-rs/canvas'

export class WebpEncoder implements Encoder {
  tempDir: string
  maxFrame: number

  async finalize(target: string, appendExt: boolean = false): Promise<void> {
    if (appendExt) {
      target += '.webp'
    }

    const files = []
    for (let i = 0; i <= this.maxFrame; i++) {
      files.push(path.join(String(this.tempDir), `${i}.png`))
    }

    const process = await img2webp.run(
      '-mixed',
      '-min_size',
      '-q',
      '80',
      '-d',
      `${Math.floor(1000 / FRAME_RATE)}`,
      '-loop',
      '1',
      ...files,
      '-o',
      target
    )

    await fs.promises.rm(this.tempDir, {recursive: true, force: true})

    if (process.failed) {
      throw new Error(`Failed to encode webp:\n${process.stderr}`)
    }
  }

  async init(): Promise<void> {
    this.tempDir = await fs.promises.mkdtemp('webp-')
  }

  async onFrame(ctx: SKRSContext2D, frame: number): Promise<void> {
    const current = ctx.canvas.toBuffer('image/png')
    const p = path.join(this.tempDir, `${frame}.png`)
    await fs.promises.writeFile(p, current)
    this.maxFrame = frame
  }
}
