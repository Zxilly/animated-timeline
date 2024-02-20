import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import url from '@rollup/plugin-url'
import {wasm} from '@rollup/plugin-wasm'
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
    commonjs({
      ignoreDynamicRequires: false,
      transformMixedEsModules: true
    }),
    url({
      include: ['**/*.woff2']
    }),
    wasm(),
    esbuild({})
  ]
}

export default config
