'use strict'

/**
 * Callback for emitting an event
 * @callback emitter
 * @param {string} name - Event name
 * @param {*} data - Data sent with event
 */

// Internal
import { AbstractMethodError } from '../util/error'

/**
 * JSONBaseParser
 * This is the Class that define the API for all JSON type parser.
 * Each subclass parser must implement at least the .next() and ._isOpenDelimiter() methods.
 * All extra methods implemented must be private and prefixed with a underline.
 * All parser must emit an event at ._close() and may emit an event at .open().
 * ._close() must be called by .next() when a closing delimiter is parsed.
 */
export default class JSONBaseParser {
  /**
   * Construct JSONBaseType
   * @param {emitter} emit - Emit a JSONStream event inside each specific parser
   */
  constructor (emit, closeEventType, openEventType) {
    this.emit = emit
    this.closed = true
  }

  /**
   * Close parser
   * @param {string} closeEventType - The event type
   * @param {*} [value] - A value to be emitted
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _close (closeEventType, value) {
    this.closed = true
    this.emit(closeEventType, value)
  }

  /**
   * Check if code represent the begin of the parsed type
   * @param  {number} code - Character's utf-8 code
   * @return {Boolean} - Whether is a valid beginning code or not
   */
  _isOpenDelimiter (code) {
    throw new AbstractMethodError(this.constructor, this._isOpenDelimiter)
  }

  /**
   * Parse next character
   * @param  {number} code - Character's utf-8 code
   * @return {?SyntaxError} - Any throw error is returned
   */
  next (code) {
    throw new AbstractMethodError(this.constructor, this.next)
  }

  /**
   * Open parser
   * @param  {number} code - Character's utf-8 code
   * @return {boolean} - Whether we opened or not
   */
  open (code) {
    return this._isOpenDelimiter(code) ? ((this.closed = false), this) : null
  }

  /**
   * Reset parser
   * @return {JSONBaseParser} - The parser
   */
  reset () {
    throw new AbstractMethodError(this.constructor, this.reset)
  }

  /**
   * Return JSON type name representation
   * @return {string} - Class string representation
   */
  get [Symbol.toStringTag] () {
    return '[JSON baseType]'
  }
}
