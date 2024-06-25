import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import url from '@rollup/plugin-url'
import typescript from '@rollup/plugin-typescript'
import {defineConfig} from 'rollup'

const config = defineConfig({
  input: 'src/action.ts',
  output: {
    file: 'dist/action.js',
    format: 'esm',
    sourcemap: true
  },
  external: ['@napi-rs/canvas', '@woff2/woff2-rs'],
  plugins: [
    typescript(),
    nodeResolve({
      exportConditions: ['node'],
      preferBuiltins: true
    }),
    commonjs({
      ignore: ['jsdom/lib/jsdom/living/generated/utils']
    }),
    url({
      include: ['**/*.woff2']
    })
  ]
})

export default config
