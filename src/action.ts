import {renderAnimatedGif} from './render/render'
import {getInput, setFailed} from '@actions/core'
import * as process from 'process'
import {gifsicle, img2webp} from './utils/bins'
import {EncoderType} from './render/encoder'

async function run(): Promise<void> {
  const name: string | null = getInput('name') === '' ? null : getInput('name')

  const token = getInput('token')
  if (!token) {
    setFailed('Token must be provided as environment variable')
    return
  }

  let typeFound = false
  let type = getInput('type')
  if (type !== 'webp' && type !== 'gif' && type !== 'both') {
    if (type !== '') {
      setFailed(`Invalid type: ${type}`)
      return
    }
    typeFound = false
  } else {
    typeFound = true
  }

  const output = getInput('output')
  if (!output) {
    setFailed('No output file specified')
    return
  }

  if (!typeFound) {
    const guessedType = output.split('.').pop()
    if (guessedType !== 'webp' && guessedType !== 'gif') {
      setFailed(
        'File type can not be determined from output file nor be specified'
      )
      return
    }

    type = guessedType
  }

  const login = getInput('login') // may be filled later

  const font = getInput('font')

  const shape = getInput('shape')
  if (!['circle', 'square', 'triangle'].includes(shape)) {
    setFailed(`Invalid shape: ${shape}`)
    return
  }

  await renderAnimatedGif({
    font,
    token,
    login,
    type: type as EncoderType,
    name,
    output,
    shape: shape as 'circle' | 'square' | 'triangle'
  })
}

;(async () => {
  if (process.argv.length > 2 && process.argv[2] === 'ensure') {
    await img2webp.ensureExist()
    await gifsicle.ensureExist()
    return
  } else {
    await run()
  }
})()
