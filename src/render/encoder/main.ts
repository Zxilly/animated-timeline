import {Encoder} from './types'
import {type SKRSContext2D} from '@napi-rs/canvas'

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

  async onFrame(ctx: SKRSContext2D, frame: number): Promise<void> {
    await Promise.all(
      this.encoders.map(async encoder => encoder.onFrame(ctx, frame))
    )
  }
}
