import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import url from '@rollup/plugin-url'
import json from '@rollup/plugin-json'
import esbuild from 'rollup-plugin-esbuild'

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/action.ts',
  output: {
    file: 'dist/action.js',
    format: 'esm',
    sourcemap: true
  },
  external: ['canvas', '@woff2/woff2-rs'],
  plugins: [
    nodeResolve({
      exportConditions: ['node'],
      preferBuiltins: true
    }),
    json(),
    commonjs(),
    url({
      include: ['**/*.woff2']
    }),
    esbuild()
  ]
}

export default config
