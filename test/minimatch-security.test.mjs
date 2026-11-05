import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {test} from 'node:test'

// Resolve the actual dependency used by TypeScript ESLint, not a root 3.x copy.
const require = createRequire(import.meta.url)
const estreeRequire = createRequire(
  require.resolve('@typescript-eslint/typescript-estree')
)
const commonjsPath = estreeRequire.resolve('minimatch')
const esmPath = resolve(dirname(commonjsPath), '../esm/index.js')
const implementations = [
  ['CommonJS', estreeRequire('minimatch')],
  ['ESM', await import(pathToFileURL(esmPath).href)]
]

// Adapted from upstream 77a0f5c4b80bdc641c3c930a1d9edf5ad2db57f8.
// Keep the attack fixture small enough that an unpatched regression fails safely.
for (const [format, {Minimatch}] of implementations) {
  test(`${format}: globstar expansion respects braceExpandMax`, () => {
    const pattern = Array(10).fill('**/../a/b').join('/')
    const mm = new Minimatch(pattern, {
      optimizationLevel: 2,
      braceExpandMax: 64
    })
    assert.equal(mm.set.length, 64)
  })

  test(`${format}: ordinary optimized patterns preserve matching`, () => {
    const mm = new Minimatch('**/../a/b/**/../c/d', {optimizationLevel: 2})
    assert.equal(mm.set.length, 4)
    assert.equal(mm.match('../a/b/../c/d'), true)
    assert.equal(mm.match('x/a/b/y/c/d'), true)
  })

  test(`${format}: large pattern sets skip quadratic deduplication`, () => {
    const small = new Minimatch('{x,*}/{0..9}', {optimizationLevel: 2})
    assert.equal(small.set.length, 10)
    const large = new Minimatch('{x,*}/{0..999}', {optimizationLevel: 2})
    assert.equal(large.set.length, 2000)
    assert.equal(large.match('x/5'), true)
    assert.equal(large.match('y/999'), true)
    assert.equal(large.match('.y/5'), false)
  })
}
