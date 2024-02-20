import {Encoder} from './types'
import {CanvasRenderingContext2D} from 'canvas'
import fs from 'fs'
import path from 'path'

export class DebugEncoder implements Encoder {
  async finalize(): Promise<void> {
    // nothing to do here
  }

  async init(): Promise<void> {
    await fs.promises.rm('tmp', {recursive: true, force: true})
    await fs.promises.mkdir('tmp')
  }

  async onFrame(ctx: CanvasRenderingContext2D, frame: number): Promise<void> {
    const current = ctx.canvas.toBuffer('image/png')
    await fs.promises.writeFile(path.join('tmp', `debug-${frame}.png`), current)
  }
}
