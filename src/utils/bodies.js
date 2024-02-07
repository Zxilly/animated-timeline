const { Common, Vertices, Body, Bounds, Vector } = require("matter-js");

module.exports = function (
  x,
  y,
  vertexSets,
  options,
  flagInternal,
  removeCollinear,
  minimumArea,
  removeDuplicatePoints
) {
  let decomp = Common.getDecomp(),
    canDecomp,
    body,
    parts,
    isConvex,
    isConcave,
    vertices,
    i,
    j,
    k,
    v,
    z

  // check decomp is as expected
  canDecomp = Boolean(decomp && decomp.quickDecomp)

  options = options || {}
  parts = []

  flagInternal = typeof flagInternal !== 'undefined' ? flagInternal : false
  removeCollinear =
    typeof removeCollinear !== 'undefined' ? removeCollinear : 0.01
  minimumArea = typeof minimumArea !== 'undefined' ? minimumArea : 10
  removeDuplicatePoints =
    typeof removeDuplicatePoints !== 'undefined' ? removeDuplicatePoints : 0.01

  // ensure vertexSets is an array of arrays
  if (!Common.isArray(vertexSets[0])) {
    vertexSets = [vertexSets]
  }

  for (v = 0; v < vertexSets.length; v += 1) {
    vertices = vertexSets[v]
    isConvex = Vertices.isConvex(vertices)
    isConcave = !isConvex

    if (isConvex || !canDecomp) {
      if (isConvex) {
        vertices = Vertices.clockwiseSort(vertices)
      } else {
        // fallback to convex hull when decomposition is not possible
        vertices = Vertices.hull(vertices)
      }

      parts.push({
        position: {x: x, y: y},
        vertices: vertices
      })
    } else {
      // initialise a decomposition
      const concave = vertices.map(function (vertex) {
        return [vertex.x, vertex.y]
      })

      // vertices are concave and simple, we can decompose into parts
      decomp.makeCCW(concave)
      if (removeCollinear !== false)
        decomp.removeCollinearPoints(concave, removeCollinear)
      if (removeDuplicatePoints !== false && decomp.removeDuplicatePoints)
        decomp.removeDuplicatePoints(concave, removeDuplicatePoints)

      // use the quick decomposition algorithm (Bayazit)
      const decomposed = decomp.quickDecomp(concave)

      // for each decomposed chunk
      for (i = 0; i < decomposed.length; i++) {
        const chunk = decomposed[i];

        // convert vertices into the correct structure
        const chunkVertices = chunk.map(function(vertices) {
          return {
            x: vertices[0],
            y: vertices[1]
          };
        });

        // skip small chunks
        if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)
          continue

        // create a compound part
        parts.push({
          position: Vertices.centre(chunkVertices),
          vertices: chunkVertices
        })
      }
    }
  }

  // create body parts
  for (i = 0; i < parts.length; i++) {
    parts[i] = Body.create(Common.extend(parts[i], options))
  }

  // flag internal edges (coincident part edges)
  if (flagInternal) {
    const coincident_max_dist = 5

    for (i = 0; i < parts.length; i++) {
      const partA = parts[i]

      for (j = i + 1; j < parts.length; j++) {
        const partB = parts[j]

        if (Bounds.overlaps(partA.bounds, partB.bounds)) {
          const pav = partA.vertices,
            pbv = partB.vertices

          // iterate vertices of both parts
          for (k = 0; k < partA.vertices.length; k++) {
            for (z = 0; z < partB.vertices.length; z++) {
              // find distances between the vertices
              const da = Vector.magnitudeSquared(
                  Vector.sub(pav[(k + 1) % pav.length], pbv[z])
                ),
                db = Vector.magnitudeSquared(
                  Vector.sub(pav[k], pbv[(z + 1) % pbv.length])
                )

              // if both vertices are very close, consider the edge concident (internal)
              if (da < coincident_max_dist && db < coincident_max_dist) {
                pav[k].isInternal = true
                pbv[z].isInternal = true
              }
            }
          }
        }
      }
    }
  }

  if (parts.length > 1) {
    // create the parent body to be returned, that contains generated compound parts
    body = Body.create(Common.extend({parts: parts.slice(0)}, options))

    // offset such that body.position is at the centre off mass
    Body.setPosition(body, {x: x, y: y})

    return body
  } else {
    return parts[0]
  }
}
