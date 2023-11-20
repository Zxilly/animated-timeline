import {renderAnimatedGif} from './render/render'
import * as core from '@actions/core'
import * as process from 'process'
import 'source-map-support/register'

async function run(): Promise<void> {
  const type = core.getInput('type')
  if (type !== 'webp' && type !== 'gif') {
    core.setFailed('Invalid type, must be webp or gif')
    return
  }

  const name: string | null =
    core.getInput('name') === '' ? null : core.getInput('name')

  const token = process.env['GITHUB_TOKEN']
  if (!token) {
    core.setFailed('Token must be provided as environment variable')
    return
  }

  const output = core.getInput('output')
  if (!output) {
    core.setFailed('Invalid output')
    return
  }

  if (name && !name.endsWith(`.${type}`)) {
    core.warning(`Output filename not met type.\nname: ${name}\ntype: ${type}`)
  }

  await renderAnimatedGif({
    token,
    type,
    name,
    output
  })
}

run()
