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

  await renderAnimatedGif({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    token: process.env['TOKEN']!,
    type,
    name,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    output: process.env['OUTPUT']!
  })
}

run()
