import assert from 'node:assert/strict'
import {after, test} from 'node:test'
import {mkdir, rm} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {rollup} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import url from '@rollup/plugin-url'
import Matter from 'matter-js'
import {createCanvas, loadImage} from '@napi-rs/canvas'
import gifenc from 'gifenc'
const {GIFEncoder, applyPalette, quantize} = gifenc

const output = resolve('test/.render-fixture')
await mkdir(output, {recursive: true})
after(() => rm(output, {recursive: true, force: true}))
const bundle = await rollup({
  input: 'src/render/text.ts',
  external: ['@napi-rs/canvas', '@woff2/woff2-rs'],
  plugins: [
    typescript({sourceMap: false, outDir: output}),
    nodeResolve({exportConditions: ['node'], preferBuiltins: true}),
    commonjs({ignore: ['jsdom/lib/jsdom/living/generated/utils']}),
    url({include: ['**/*.woff2']})
  ]
})
await bundle.write({file: `${output}/text.mjs`, format: 'esm'})
await bundle.close()
const {drawText, loadFont} = await import(pathToFileURL(`${output}/text.mjs`))
await loadFont()

function countHoles(canvas) {
  const {width, height} = canvas
  const data = canvas.getContext('2d').getImageData(0, 0, width, height).data
  const seen = new Uint8Array(width * height)
  let holes = 0
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || data[start * 4] < 128) continue
    let border = false
    const queue = [start]
    seen[start] = 1
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i]
      const x = p % width
      const y = Math.floor(p / width)
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1)
        border = true
      const neighbors = []
      if (x > 0) neighbors.push(p - 1)
      if (x + 1 < width) neighbors.push(p + 1)
      if (y > 0) neighbors.push(p - width)
      if (y + 1 < height) neighbors.push(p + width)
      for (const next of neighbors) {
        if (!seen[next] && data[next * 4] >= 128) {
          seen[next] = 1
          queue.push(next)
        }
      }
    }
    if (!border && queue.length > 20) holes++
  }
  return holes
}

function renderGlyphs() {
  const engine = Matter.Engine.create()
  drawText(engine.world, 'OB8')
  const bodies = Matter.Composite.allBodies(engine.world)
  assert.ok(bodies.length > 30, 'expected real triangulated glyph bodies')
  for (const body of bodies) {
    for (const vertex of body.vertices) {
      assert.ok(Number.isFinite(vertex.x) && Number.isFinite(vertex.y))
    }
  }
  const canvas = createCanvas(1200, 500)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const render = Matter.Render.create({
    canvas,
    engine,
    options: {width: 1200, height: 500, wireframes: false}
  })
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  Matter.Render.bodies(render, bodies, ctx)
  return canvas
}

for (const format of ['gif', 'webp']) {
  test(`OB8 keeps its five interior holes through ${format} encoding`, async () => {
    const canvas = renderGlyphs()
    assert.equal(countHoles(canvas), 5)
    let bytes
    if (format === 'gif') {
      const rgba = canvas.getContext('2d').getImageData(0, 0, 1200, 500).data
      const palette = quantize(rgba, 256)
      const gif = GIFEncoder()
      gif.writeFrame(applyPalette(rgba, palette), 1200, 500, {
        palette,
        delay: 20
      })
      gif.finish()
      bytes = Buffer.from(gif.bytes())
      assert.equal(bytes.subarray(0, 6).toString(), 'GIF89a')
    } else {
      bytes = canvas.toBuffer('image/webp')
      assert.equal(bytes.subarray(8, 12).toString(), 'WEBP')
    }
    const decoded = await loadImage(bytes)
    assert.equal(decoded.width, 1200)
    assert.equal(decoded.height, 500)
    const roundtrip = createCanvas(1200, 500)
    roundtrip.getContext('2d').drawImage(decoded, 0, 0)
    assert.equal(countHoles(roundtrip), 5)
  })
}
