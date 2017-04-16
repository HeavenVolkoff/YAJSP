'use strict'

// Node
import { Writable } from 'stream'

// Internal
import JSONNumber from './JSONNumber'
import JSONBaseType from './JSONBaseType'
import { SPACE, NEW_LINE, HORIZONTAL_TAB, CARRIAGE_RETURN } from './constants'

export class JSONStream extends Writable {
  constructor () {
    super()

    /**
     * Root JSON type
     * Can be a: String; Number, Array, Object, true, false, null
     * @type {?JSONBaseType}
     */
    this.root = null

    /** @function init */
    this.next = this.init

    // Listen to finish event to assure JSON has correctly ended
    this.once('finish', this.onFinish)
  }

  /**
   * Assure JSON ended correctly, in case not thrown error
   */
  onFinish () {
    const root = this.root

    if (root instanceof JSONNumber) {
      // This is an edge case, see JSONNumber class definition for explanation.
      root.next(SPACE)
    } else if (root === null || !root.closed) {
      this.emit('error', new SyntaxError('Unexpected end of JSON input'))
    }
  }

  /**
   * Initialize JSONStream based on first received character
   * @param  {number} code - Character's utf-8 code
   * @return {?SyntaxError} - Any throw error is returned
   */
  init (code) {
    let error = null

    if (this.root !== null) {
      // In case root is already initialized redirect call to root.next
      error = root.next(code)
    } else if (
      code !== SPACE &&
      code !== NEW_LINE &&
      code !== HORIZONTAL_TAB &&
      code !== CARRIAGE_RETURN
    ) {
      const emit = (name, data) => this.emit(name, data)
      const root = JSONBaseType.create(code, emit)

      if (root === null) {
        error = new SyntaxError(
          `Unexpected token ${String.fromCharCode(code)} at start of JSON input`
        )
      } else {
        this.root = root
        this.next = code => this.root.next(code)
      }
    }

    return error
  }

  _write (chunk, _, done) {
    const next = this.next
    const length = chunk.length

    let i = -1
    let error = null
    while (++i < length && error !== null) {
      error = next(chunk[i])
    }

    done(error)
  }
}
