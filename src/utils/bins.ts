import BinWrapper from '@zxilly/bin-wrapper'
import path from 'path'
import * as process from 'process'

const gifsicleBase =
  'https://github.com/Zxilly/gifsicle-prebuilt/releases/download/v1.94/'

export const gifsicle = new BinWrapper()
  .src(`${gifsicleBase}gifsicle-linux-v1.94`, 'linux', 'x64')
  .src(`${gifsicleBase}gifsicle-macos-v1.94`, 'darwin', 'x64')
  .src(`${gifsicleBase}gifsicle-windows-v1.94.exe`, 'win32', 'x64')
  .dest(path.join('vendor'))
  .use(process.platform === 'win32' ? 'gifsicle.exe' : 'gifsicle')

const img2webpBase =
  'https://storage.googleapis.com/downloads.webmproject.org/releases/webp/'
export const img2webp = new BinWrapper()
  .compressedSrc(
    `${img2webpBase}libwebp-1.3.2-windows-x64.zip`,
    'win32',
    'x64',
    'img2webp',
    2
  )
  .compressedSrc(
    `${img2webpBase}libwebp-1.3.2-linux-x86-64.tar.gz`,
    'linux',
    'x64',
    'img2webp',
    2
  )
  .compressedSrc(
    `${img2webpBase}libwebp-1.3.2-mac-x86-64.tar.gz`,
    'darwin',
    'x64',
    'img2webp',
    2
  )
  .dest(path.join('vendor'))
  .use(process.platform === 'win32' ? 'img2webp.exe' : 'img2webp')
