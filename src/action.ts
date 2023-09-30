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
  const token = process.env['TOKEN']
  if (!token) {
    core.setFailed('Invalid token')
    return
  }

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
