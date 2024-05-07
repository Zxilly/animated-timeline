import {MainEncoder} from './encoder/main'
import {Encoder} from './encoder/types'
import {WebpEncoder} from './encoder/webp'
import {GifEncoder} from './encoder/gif'
import {debug} from './const'
import {DebugEncoder} from './encoder/debug'

export type EncoderType = 'webp' | 'gif' | 'both'

export function loadEncoder(type: EncoderType) {
  const encoders: Encoder[] = []
  if (type === 'both') {
    encoders.push(new WebpEncoder())
    encoders.push(new GifEncoder())
  } else {
    switch (type) {
      case 'webp':
        encoders.push(new WebpEncoder())
        break
      case 'gif':
        encoders.push(new GifEncoder())
        break
      default:
        throw new Error(`Unknown encoder type: ${type}`)
    }
  }

  if (debug) {
    encoders.push(new DebugEncoder())
  }

  return new MainEncoder(encoders)
}
