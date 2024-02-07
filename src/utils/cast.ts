import {CanvasRenderingContext2D as NodeCanvasRenderingContext2D} from 'canvas'

export function castCanvas(
  canvas: NodeCanvasRenderingContext2D
): CanvasRenderingContext2D {
  return canvas as unknown as CanvasRenderingContext2D
}
