import {renderAnimatedGif} from './render/render'
import * as core from '@actions/core'
import * as process from 'process'
import 'source-map-support/register'

async function run(): Promise<void> {
  const type = core.getInput('type')
  if (type !== 'webp' && type !== 'gif' && type !== 'both') {
    core.setFailed('Invalid type, must be webp, gif or both')
    return
  }

  const name: string | null =
    core.getInput('name') === '' ? null : core.getInput('name')

  const token = process.env['GITHUB_TOKEN']
  if (!token) {
    core.setFailed('Token must be provided as environment variable')
    return
  }

  let output = core.getInput('output')
  if (!output) {
    core.setFailed('Invalid output')
    return
  }

  if (type !== 'both' && !output.endsWith(`.${type}`)) {
    core.warning(`Output file name does not end with .${type}`)
    output += `.${type}`
  }

  await renderAnimatedGif({
    token,
    type,
    name,
    output
  })
}

run()
