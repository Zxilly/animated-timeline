import {CanvasRenderingContext2D} from 'canvas'

export interface Encoder {
  init(): Promise<void>
  onFrame(ctx: CanvasRenderingContext2D, frame: number): Promise<void>

  finalize(target: string, appendExt: boolean): Promise<void>
}
