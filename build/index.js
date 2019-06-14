import babel from 'rollup-plugin-babel'
import buble from 'rollup-plugin-buble'

const { join } = require('path')

export default {
  input: join(__dirname, '..', 'src', 'main.js'),
  output: {
    file: join(__dirname, '..', 'dist', 'index.js'),
    format: 'es',
  },
  plugins: [
    babel({ extensions: [".js"], runtimeHelpers: true, exclude: ["node_modules/**"] }),
    buble()
  ]
}
