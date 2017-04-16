'use strict'

process.env.BUILD = 'development'

const vm = require('vm')
const { rollup } = require('rollup')
const rollupConfig = require('../rollup.config')
const { parse, resolve, join, basename } = require('path')
const { readdirSync, statSync } = require('fs')

const { ownKeys } = Reflect
const { getOwnPropertyDescriptor, getPrototypeOf, create, assign } = Object

const copy = object => {
  const keys = ownKeys(object)
  const props = {}
  const keyLength = keys.length

  let i = -1
  while (++i < keyLength) {
    const key = keys[i]
    props[key] = getOwnPropertyDescriptor(object, key)
  }

  return create(getPrototypeOf(object), props)
}

/**
 * List all files in a directory recursively in a synchronous fashion
 *
 * @link https://gist.github.com/kethinov/6658166
 * @param {string} dir - The directory to be analyzed
 * @param {Array.<string>} [fileList] - Array containing the found files
 * @returns {Array} - Array containing the found files
 */
const walkSync = (dir, fileList) => {
  fileList = fileList || []

  readdirSync(dir).forEach(file => {
    let path = join(dir, file)

    if (statSync(path).isDirectory()) {
      fileList = walkSync(path, fileList)
    } else {
      fileList.push(file)
    }
  })

  return fileList
}

const _global = assign(copy(global), {
  module: module,
  require: require,
  exports: module.exports
})

const runTest = path => {
  const { base, dir: _dir } = parse(path)
  const dir = resolve(__dirname, _dir)
  rollupConfig.entry = path
  rollupConfig.onwarn = () => {}

  return rollup(rollupConfig).then(bundle => {
    const { code, map } = bundle.generate({
      format: 'cjs',
      intro: `require('source-map-support').install({
  overrideRetrieveFile: true,
  overrideRetrieveSourceMap: true,
  retrieveFile: () => __code,
  retrieveSourceMap: () => {
    return {
      url: __filename + '.map',
      map: __sourceMap
    }
  }
});`,
      exports: 'none',
      sourceMap: true
    })
    _global.__code = code
    _global.__dirname = dir
    _global.__filename = base
    _global.__sourceMap = map.toString()

    vm.runInNewContext(code, _global, {
      filename: join(dir, base),
      displayError: true
    })
  })
}

let files = null

if (process.argv.length < 3) {
  const thisFile = basename(__filename)
  files = walkSync(__dirname).filter(file => file !== thisFile)
} else {
  files = process.argv.slice(2)
}

Promise.all(files.map(val => runTest(join(__dirname, val)))).catch(error => {
  console.error(error.message)
  process.exit(1)
})
