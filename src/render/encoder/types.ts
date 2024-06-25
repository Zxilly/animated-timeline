import {type SKRSContext2D} from '@napi-rs/canvas'

export interface Encoder {
  init(): Promise<void>

  onFrame(ctx: SKRSContext2D, frame: number): Promise<void>

  finalize(target: string, appendExt: boolean): Promise<void>
}
