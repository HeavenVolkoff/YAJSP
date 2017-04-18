'use strict'

import Resettable from '../mixins/Resettable'
import JSONBaseParser from './JSONBaseParser'
import { nextPowerOfTwo } from '../util/misc'
import {
  ZERO,
  NINE,
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
} from '../util/constants'

const { concat: concatBuffer, byteLength, poolSize: POOL_SIZE } = Buffer

export default class JSONStringParser extends Resettable(JSONBaseParser) {
  /**
   * Create JSONString
   * @param {emitter} emit - Emit a JSONStream (value or key) event
   * @param {Boolean} [isKey] - Describe if this is a string or an object key
   */
  constructor (emit, isKey) {
    super(emit)

    if (isKey) {
      this.buffer = Buffer.allocUnsafe(32)
      this.eventType = 'key'
    } else {
      this.buffer = Buffer.allocUnsafe(128)
      this.eventType = 'value'
    }

    this.cache = null
    this.offset = 0
    this.length = 0
    this.escaped = false
    this.unicode = 0
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
    if (index === this.buffer.length) {
      const error = this._realloc(1)
      if (error !== null) return error
      index = 0
    }

    this.length = length + 1
    this.buffer[index] = code

    return null
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

    // TODO: Implement strictString option
    // Assert that generated string doesn't have invalid UTF-8 sequences
    if (buffer.compare(Buffer.from(str)) !== 0) {
      return new SyntaxError(`Invalid UTF-8 sequence: ${str} at ${this}.`)
    }

    super._close(this.eventType, str)

    return null
  }

  /**
   * Check if code represent the begin of the parsed type
   * @param  {number} code - Character's utf-8 code
   * @return {Boolean} - Whether is a valid beginning code or not
   */
  _isOpenDelimiter (code) {
    return code === QUOTATION_MARK
  }

  /**
   * Parse next character of a JSON string
   * @param  {number} code - Character's utf-8 code
   * @return {?SyntaxError} - Any throw error is returned
   * @override
   */
  next (code) {
    const { escaped, unicodeCount } = this

    // In case of attempt to add a char after string was closed
    if (this.ended) {
      return new SyntaxError(
        `Unexpected token: ${String.fromCharCode(code)}, after ${this} end.`
      )
    }

    // In case we are parsing a Unicode sequence
    if (unicodeCount > -1) return this._parseUnicodeSequence(code)

    // Special treatment for escaped char sequences
    if (escaped) {
      this.escaped = false
      switch (code) {
        case LOWERCASE_N:
          return this._append(NEW_LINE)
        case QUOTATION_MARK:
          return this._append(QUOTATION_MARK)
        case REVERSE_SOLIDUS:
          return this._append(REVERSE_SOLIDUS)
        case LOWERCASE_R:
          return this._append(CARRIAGE_RETURN)
        case LOWERCASE_T:
          return this._append(HORIZONTAL_TAB)
        case LOWERCASE_B:
          return this._append(BACKSPACE)
        case LOWERCASE_F:
          return this._append(FORMFEED)
        case LOWERCASE_U:
          this.unicodeCount = 0
          return null
        case SOLIDUS:
          return this._append(SOLIDUS)
        default:
          return new SyntaxError(
            `Unexpected escaped token: ${String.fromCharCode(code)} at ${this}`
          )
      }
    }

    switch (code) {
      case NEW_LINE:
      case FORMFEED:
      case BACKSPACE:
      case HORIZONTAL_TAB:
      case CARRIAGE_RETURN:
        return new SyntaxError(
          `Unexpected escaped token: ${String.fromCharCode(code)} at ${this}`
        )
      case QUOTATION_MARK:
        return this._close()
      case REVERSE_SOLIDUS:
        this.escaped = true
        return null
      default:
        return this._append(code)
    }
  }

  /**
   * Parse special Unicode sequence inside a string
   * @param  {number} code - Partial Unicode hex code
   * @param  {number} index - Index at which store code
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _parseUnicodeSequence (code) {
    const codePoint = code >= ZERO && code <= NINE
      ? code - ZERO
      : code >= UPPERCASE_A && code <= UPPERCASE_F
          ? code - UPPERCASE_A + 10
          : code >= LOWERCASE_A && code <= LOWERCASE_F
              ? code - LOWERCASE_A + 10
              : 16

    if (codePoint > 15) {
      return new SyntaxError(
        `Invalid unicode sequence hex: ${code} at ${this}.`
      )
    }

    const unicodeCount = this.unicodeCount

    if (unicodeCount < 3) {
      this.unicode += codePoint << (12 - 4 * unicodeCount)
      this.unicodeCount += 1
    } else {
      // TODO: Find a better way to do this
      const str = String.fromCharCode(this.unicode + codePoint)
      const strByteLength = byteLength(str, 'utf8')

      let index = this.length - this.offset

      if (index + strByteLength >= this.buffer.length) {
        const error = this._realloc(strByteLength)
        if (error !== null) return error
        index = 0
      }

      if (
        strByteLength !== this.buffer.write(str, index, strByteLength, 'utf8')
      ) {
        return new RangeError(
          `Failed to append unicode sequence: ${str} at ${this}`
        )
      }

      this.length += strByteLength
      this.unicode = 0
      this.unicodeCount = -1 // Disable Unicode sequence parser
    }

    return null
  }

  /**
   * Reallocate internal buffer
   * @param  {number} extraLength - How much more length is needed
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _realloc (extraLength) {
    const length = this.length

    // TODO: implement option to ignore reallocation limit
    if (length >= POOL_SIZE) {
      return new RangeError(
        `${this} internal buffer exceed maximum capacity of ${POOL_SIZE}`
      )
    }

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

    return null
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
