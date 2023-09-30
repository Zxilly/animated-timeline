import {renderAnimatedGif} from './render/render'
import * as core from '@actions/core'
import * as process from 'process'

async function run(): Promise<void> {
  const type = process.env['TYPE']
  if (type !== 'webp' && type !== 'gif') {
    core.setFailed('Invalid type')
    return
  }

  const name = process.env['NAME'] === '' ? undefined : process.env['NAME']
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const token = process.env['GITHUB_TOKEN']!

  const output = process.env['OUTPUT']
  if (!output) {
    core.setFailed('Invalid output')
    return
  }

  await renderAnimatedGif({
    token,
    type,
    name,
    output
  })
}

run()
