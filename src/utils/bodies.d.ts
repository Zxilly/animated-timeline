declare function createBody(
  x: number,
  y: number,
  vertexSets: {x: number; y: number}[][],
  options?: any,
  flagInternal?: boolean,
  removeCollinear?: number,
  minimumArea?: number,
  removeDuplicatePoints?: number
): any

export = createBody
