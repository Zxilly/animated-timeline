import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
import shouldDelete from '../.github/scripts/should-delete-image.cjs'

const cases = [
  ['untagged image', [], true],
  ['temporary PR build', ['pr-42'], true],
  ['temporary commit build', ['sha-abc1234'], true],
  ['multiple temporary tags', ['pr-42', 'sha-abc1234'], true],
  ['release version', ['1.0.1'], false],
  ['release and latest', ['1.0.1', 'latest'], false],
  ['prerelease version', ['2.0.0-rc.1'], false],
  ['sanitized build metadata', ['1.0.1-build.42'], false],
  ['legacy version prefix', ['v1.0.1'], false],
  ['master alias', ['master'], false],
  ['latest alias', ['latest'], false],
  ['release on a shared digest', ['pr-42', '1.0.1'], false],
  ['alias on a shared digest', ['sha-abc1234', 'master'], false]
]

for (const [name, tags, expected] of cases) {
  test(name, () => {
    assert.equal(shouldDelete({metadata: {container: {tags}}}), expected)
  })
}

test('the runtime image pinned by action.yml is protected', () => {
  const action = readFileSync(new URL('../action.yml', import.meta.url), 'utf8')
  const tag = action.match(
    /docker:\/\/ghcr\.io\/zxilly\/animatedtimeline:([^\s'"\r\n]+)/
  )?.[1]
  assert.ok(tag, 'expected an explicit runtime image tag in action.yml')
  assert.equal(shouldDelete({metadata: {container: {tags: [tag]}}}), false)
})
