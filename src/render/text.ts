import {type Font, parse} from 'opentype.js'
import fontBin from '../../font/noto.woff2'
import fs from 'fs'
import {fileURLToPath} from 'node:url'
import {fontSize, HEIGHT, WIDTH} from './const'
import Matter, {Body, Bounds, Composite, Vector, World} from 'matter-js'
import earcut from 'earcut'
import {decode} from '@woff2/woff2-rs'
import paper from 'paper/dist/paper-core'

let font: Font

export function useFont(): Font {
  return font
}

export async function loadFont(newFont?: string): Promise<void> {
  if (!newFont) {
    newFont = fileURLToPath(new URL(fontBin, import.meta.url))
  }

  const buf = await fs.promises.readFile(newFont)

  if (newFont.endsWith('.woff2')) {
    const decompressed = decode(buf)
    font = parse(decompressed.buffer)
    return
  } else {
    font = parse(buf.buffer)
  }
}

export function drawText(world: Matter.World, name: string): void {
  paper.setup(new paper.Size(1, 1))
  paper.view.autoUpdate = false

  const paths = font.getPaths(name, WIDTH / 2, HEIGHT / 2, fontSize)

  // keeps ref to all bodies, later move them to center
  const bodies: Body[] = []
  const letters: Composite[] = []

  for (const path of paths) {
    const paperPaths: paper.Path[] = []

    const lastPath = (): paper.Path => paperPaths[paperPaths.length - 1]

    for (const cmd of path.commands) {
      switch (cmd.type) {
        case 'M':
          paperPaths.push(new paper.Path())
          lastPath().moveTo(new paper.Point(cmd.x, cmd.y))
          break
        case 'L':
          lastPath().lineTo(new paper.Point(cmd.x, cmd.y))
          break
        case 'Q':
          lastPath().quadraticCurveTo(
            new paper.Point(cmd.x1, cmd.y1),
            new paper.Point(cmd.x, cmd.y)
          )
          break
        case 'C':
          lastPath().cubicCurveTo(
            new paper.Point(cmd.x1, cmd.y1),
            new paper.Point(cmd.x2, cmd.y2),
            new paper.Point(cmd.x, cmd.y)
          )
          break
        case 'Z':
          lastPath().closed = true
          break
      }
    }

    for (const p of paperPaths) {
      p.flatten()
    }

    paperPaths.sort((a, b) => Math.abs(b.area) - Math.abs(a.area))

    type item = {
      path: paper.Path
      children: item[]
    }

    const roots: item[] = []

    for (const p of paperPaths) {
      let parent: item | null = null
      for (let i = roots.length - 1; i >= 0; --i) {
        // a contour is a hole if it is inside its parent and has different winding
        if (
          roots[i].path.contains(p.firstSegment.point) &&
          p.clockwise !== roots[i].path.clockwise
        ) {
          parent = roots[i]
          break
        }
      }
      if (parent) {
        parent.children.push({path: p, children: []})
      } else {
        roots.push({path: p, children: []})
      }
    }

    const compounds: Composite[] = []

    const processItem = (item: item, shouldRender: boolean): void => {
      if (shouldRender) {
        // prepare for earcut
        const vertices: number[] = []
        const holes: number[] = []

        for (const seg of item.path.segments) {
          vertices.push(seg.point.x, seg.point.y)
        }

        for (const child of item.children) {
          const childSegments = child.path.segments
          const points = childSegments.map(seg => seg.point)

          points.reverse() // hole has different winding

          holes.push(vertices.length / 2)

          for (const seg of childSegments) {
            vertices.push(seg.point.x, seg.point.y)
          }
        }

        // cut it
        const triangles = earcut(vertices, holes)

        const partBodies: Matter.Body[] = []

        for (let i = 0; i < triangles.length; i += 3) {
          const triangleVertices = [
            {x: vertices[triangles[i] * 2], y: vertices[triangles[i] * 2 + 1]},
            {
              x: vertices[triangles[i + 1] * 2],
              y: vertices[triangles[i + 1] * 2 + 1]
            },
            {
              x: vertices[triangles[i + 2] * 2],
              y: vertices[triangles[i + 2] * 2 + 1]
            }
          ]

          // Create a new body directly with the triangle vertices
          const triangleBody = Matter.Body.create({
            position: Matter.Vertices.centre(triangleVertices),
            vertices: triangleVertices,
            isStatic: true,
            render: {
              fillStyle: '#000000',
              lineWidth: 0.1, // precision issue workaround
              strokeStyle: '#000000'
            }
          })
          bodies.push(triangleBody)
          partBodies.push(triangleBody)
        }

        const compound = Composite.create({
          bodies: partBodies
        })
        compounds.push(compound)
      }
      for (const child of item.children) {
        processItem(child, !shouldRender)
      }
    }

    for (const root of roots) {
      processItem(root, true)
    }

    const letter = Composite.create({
      composites: compounds
    })
    letters.push(letter)
  }

  const fontComposite = Composite.create({
    composites: letters
  })

  const vertices: Matter.Vertices[] = []
  // move all bodies to center
  for (const body of bodies) {
    vertices.push(body.bounds.min, body.bounds.max)
  }

  const bounds = Bounds.create(vertices)

  const boundCenter = Vector.div(Vector.add(bounds.min, bounds.max), 2)
  const center = Vector.create(WIDTH / 2, HEIGHT / 2)
  const translate = Vector.sub(center, boundCenter)

  for (const body of bodies) {
    Body.translate(body, translate)
  }

  // Composite.translate(fontComposite, translate)

  World.addComposite(world, fontComposite)
}
