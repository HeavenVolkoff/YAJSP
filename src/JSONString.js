'use strict'

import Resettable from './mixins/Resettable'
import JSONBaseType from './JSONBaseType'
import { nextPowerOfTwo } from './util/index'
import {
  NUMBER_ZERO,
  NUMBER_NINE,
  LOWERCASE_A,
  LOWERCASE_B,
  LOWERCASE_F,
  LOWERCASE_R,
  LOWERCASE_N,
  LOWERCASE_T,
  LOWERCASE_U,
  UPPERCASE_A,
  UPPERCASE_F,
  SOLIDUS,
  FORMFEED,
  NEW_LINE,
  BACKSPACE,
  QUOTATION_MARK,
  HORIZONTAL_TAB,
  REVERSE_SOLIDUS,
  CARRIAGE_RETURN
} from './util/constants'

const { concat: concatBuffer, byteLength, poolSize: POOL_SIZE } = Buffer

export default class JSONString extends Resettable(JSONBaseType) {
  /**
   * Create JSONString
   * @param {emitter} emit - Emit a JSONStream (value or key) event
   * @param {Boolean} [isKey] - Describe if this is a string or an object key
   */
  constructor (emit, isKey) {
    super(emit)
    this.cache = null
    this.buffer = Buffer.allocUnsafe(isKey ? 32 : 128)
    this.offset = 0
    this.length = 0
    this.escaped = false
    this.unicode = 0
    this.eventType = isKey ? 'key' : 'value'
    this.unicodeCount = -1
  }

  /**
   * Append char to internal buffer
   * @param  {number} code - Character's utf-8 code
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _append (code) {
    const length = this.length

    let index = length - this.offset
    let error = null

    if (index === this.buffer.length) {
      error = this._realloc(1)
      index = 0
    }

    this.length = length + 1
    this.buffer[index] = code

    return error
  }

  /**
   * Close string
   * @return {?SyntaxError} - Any throw error is returned
   * @override
   * @protected
   */
  _close () {
    const { cache, length } = this
    const buffer = cache === null
      ? this.buffer.slice(0, length)
      : concatBuffer(cache, length)
    const str = buffer.toString('utf8')
    let error = null

    // Assert that generated string doesn't have invalid UTF-8 sequences
    // TODO: Implement strictString option
    if (buffer.compare(Buffer.from(str)) === 0) {
      this.emit(this.eventType, str)
    } else {
      error = new SyntaxError(`Invalid UTF-8 sequence: ${str} at ${this}.`)
    }

    this.ended = true

    return error
  }

  /**
   * Parse next character of a JSON string
   * @param  {number} code - Character's utf-8 code
   * @return {?SyntaxError} - Any throw error is returned
   * @override
   */
  next (code) {
    const { escaped, unicodeCount } = this
    let error = null

    // In case of attempt to add a char after string was closed
    if (this.ended) {
      error = new SyntaxError(
        `Unexpected token: ${String.fromCharCode(code)}, after ${this} end.`
      )
    } else if (unicodeCount > -1) {
      // In case we are parsing a Unicode sequence
      error = this._parseUnicodeSequence(code)
    } else if (escaped) {
      // Special treatment for escaped char sequences
      this.escaped = false
      switch (code) {
        case LOWERCASE_B:
          error = this._append(BACKSPACE)
          break
        case LOWERCASE_F:
          error = this._append(FORMFEED)
          break
        case LOWERCASE_N:
          error = this._append(NEW_LINE)
          break
        case LOWERCASE_R:
          error = this._append(CARRIAGE_RETURN)
          break
        case LOWERCASE_T:
          error = this._append(HORIZONTAL_TAB)
          break
        case LOWERCASE_U:
          // Enables Unicode sequence parser
          this.unicodeCount = 0
          break
        case SOLIDUS:
        case QUOTATION_MARK:
        case REVERSE_SOLIDUS:
          error = this._append(code)
          break
        default:
          // TODO: Implement strictString option
          error = new SyntaxError(
            `Unexpected escaped token: ${String.fromCharCode(code)} at ${this}`
          )
      }
    } else {
      switch (code) {
        case NEW_LINE:
        case FORMFEED:
        case BACKSPACE:
        case HORIZONTAL_TAB:
        case CARRIAGE_RETURN:
          error = new SyntaxError(
            `Unexpected escaped token: ${String.fromCharCode(code)} at ${this}`
          )
          break
        case QUOTATION_MARK:
          error = this._close()
          break
        case REVERSE_SOLIDUS:
          this.escaped = true
          break
        default:
          error = this._append(code)
          break
      }
    }

    return error
  }

  /**
   * Parse special Unicode sequence inside a string
   * @param  {number} code - Partial Unicode hex code
   * @param  {number} index - Index at which store code
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _parseUnicodeSequence (code) {
    const codePoint = code >= NUMBER_ZERO && code <= NUMBER_NINE
      ? code - NUMBER_ZERO
      : code >= UPPERCASE_A && code <= UPPERCASE_F
          ? code - UPPERCASE_A + 10
          : code >= LOWERCASE_A && code <= LOWERCASE_F
              ? code - LOWERCASE_A + 10
              : 16

    let error = null
    if (codePoint > 15) {
      error = new SyntaxError(
        `Invalid unicode sequence hex: ${code} at ${this}.`
      )
    } else {
      switch (this.unicodeCount) {
        case 0:
          this.unicode = codePoint << 12
          this.unicodeCount = 1
          break
        case 1:
          this.unicode += codePoint << 8
          this.unicodeCount = 2
          break
        case 2:
          this.unicode += codePoint << 4
          this.unicodeCount = 3
          break
        case 3:
          // TODO: Find a better way to do this
          const str = String.fromCharCode(this.unicode + codePoint)
          const strByteLength = byteLength(str, 'utf8')

          let index = this.length - this.offset

          if (index + strByteLength >= this.buffer.length) {
            error = this._realloc(strByteLength)
            index = 0
          }

          if (
            strByteLength ===
            this.buffer.write(str, index, strByteLength, 'utf8')
          ) {
            this.length += strByteLength
          } else {
            error = new RangeError(
              `Failed to append unicode sequence: ${str} at ${this}`
            )
          }

          this.unicodeCount = -1 // Disable Unicode sequence parser
          break
      }
    }

    return error
  }

  /**
   * Reallocate internal buffer
   * @param  {number} extraLength - How much more length is needed
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _realloc (extraLength) {
    const length = this.length
    let error = null

    // TODO: implement option to ignore reallocation limit
    if (length >= POOL_SIZE) {
      error = new RangeError(
        `${this} internal buffer exceed maximum capacity of ${POOL_SIZE}`
      )
    } else {
      const { cache, buffer } = this
      const extra = Buffer.allocUnsafe(
        length < extraLength ? nextPowerOfTwo(extraLength) : length
      )

      if (cache === null) {
        this.cache = [buffer, extra]
      } else {
        cache.push(extra)
      }

      this.buffer = extra
      this.offset = length
    }

    return error
  }

  /**
   * Reset object to be reused
   * @return {Resettable} - Reset object
   * @override
   */
  reset () {
    this.cache = null
    this.offset = 0
    this.length = 0
    this.escaped = false
    this.unicode = 0
    this.unicodeCount = -1
    return this
  }

  /**
   * Object string representation
   * @return {string} - Object string representation
   * @override
   */
  get [Symbol.toStringTag] () {
    return '[JSON string]'
  }
}
