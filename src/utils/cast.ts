import {SKRSContext2D} from '@napi-rs/canvas'

export function castCanvas(canvas: SKRSContext2D): CanvasRenderingContext2D {
  return canvas as unknown as CanvasRenderingContext2D
}
