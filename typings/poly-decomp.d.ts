declare module 'poly-decomp' {
  type Polygon = [number, number][]

  export function isSimple(polygon: Polygon): boolean

  export function makeCCW(polygon: Polygon): boolean

  export function quickDecomp(polygon: Polygon): Polygon[]

  export function decomp(polygon: Polygon): Polygon[]

  export function removeCollinearPoints(
    polygon: Polygon,
    thresholdAngle: number
  ): number

  export function removeDuplicatePoints(
    polygon: Polygon,
    precision: number
  ): void
}
