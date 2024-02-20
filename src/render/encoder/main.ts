import {CanvasRenderingContext2D} from 'canvas'
import {Encoder} from './types'

export class MainEncoder implements Encoder {
  private readonly encoders: Encoder[]

  constructor(encoders: Encoder[]) {
    this.encoders = encoders
  }

  async finalize(target: string, appendExt: boolean = false): Promise<void> {
    await Promise.all(
      this.encoders.map(async encoder => encoder.finalize(target, appendExt))
    )
  }

  async init(): Promise<void> {
    await Promise.all(this.encoders.map(async encoder => encoder.init()))
  }

  async onFrame(ctx: CanvasRenderingContext2D, frame: number): Promise<void> {
    await Promise.all(
      this.encoders.map(async encoder => encoder.onFrame(ctx, frame))
    )
  }
}
