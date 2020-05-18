'use strict'

import JSONNumberParser from './JSONNumberParser'
import JSONStringParser from './JSONStringParser'

const keys = Object.key

/**
 * Holds references for all specialized parsers.
 * To add a parser just import it's class definition into this file and add a getter for it in this object.
 * Lazy getters are preferred: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
 * @type {Object}
 */
const factoryProps = {
  JSONNumberParser: {
    get: function () {
      delete this.JSONNumberParser
      return (this.JSONNumberParser = new JSONNumberParser(this.emit))
    }
  },
  JSONStringParser: {
    get: function () {
      delete this.JSONStringParser
      return (this.JSONStringParser = new JSONStringParser(this.emit))
    }
  }
}

/**
 * Open specialized parser according to received char code.
 * @param  {number} code - First char code to be parsed.
 * @return {?JSONObjectParser} - Instance of the specialized parser that handles the receive char code.
 */
function factoryOpen (code) {
  // https://bugs.chromium.org/p/v8/issues/detail?id=164
  const availableParsers = this.availableParsers
  const availableParsersLength = availableParsers.length

  let i = -1
  let rootParser = null
  while (++i < availableParsersLength && rootParser === null) {
    rootParser = this[availableParsers[i]].open(code)
  }

  return rootParser
}

/**
 * Generate access to singleton instances of available parsers.
 * Should be called at the beginning of parsing with the first character.
 * @param  {number} code - First char code to be parsed.
 * @param  {emitter} emit - Emit a JSONStream event inside each specific parser.
 * @return {?JSONObjectParser} - Instance of the specialized parser that handles the receive char code.
 */
export default (code, emit) => {
  const factory = Object.create(
    { emit: emit, availableParsers: keys(factoryProps), open: factoryOpen },
    factoryProps
  )

  return factory.open(code)
}
