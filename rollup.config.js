'use strict'

const isDev = process.env.BUILD === 'development'

let plugins = []
if (!isDev) plugins = plugins.concat([])

module.exports = {
  dest: 'index.js',
  entry: 'src/JSONStream.js',
  format: 'cjs',
  plugins: plugins
}
