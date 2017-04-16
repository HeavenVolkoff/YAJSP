'use strict'

// Internal
import JSONArray from './JSONArray' // TODO
import JSONValue from './JSONValue' // TODO
import JSONNumber from './JSONNumber' // TODO
import JSONObject from './JSONObject' // TODO
import JSONString from './JSONString' // TODO
import { AbstractMethodError } from './util/error'
import {
  NUMBER_ZERO,
  NUMBER_ONE,
  NUMBER_TWO,
  NUMBER_THREE,
  NUMBER_FOUR,
  NUMBER_FIVE,
  NUMBER_SIX,
  NUMBER_SEVEN,
  NUMBER_EIGHT,
  NUMBER_NINE,

  BRACES,
  BRACKET,
  LETTER_F,
  LETTER_N,
  LETTER_T,
  HYPHEN_MINUS,
  QUOTATION_MARK,

  NULL_BUFFER,
  TRUE_BUFFER,
  FALSE_BUFFER
} from './constants'

/**
 * Callback for emitting an event
 * @callback emitter
 * @param {string} name - Event name
 * @param {*} data - Data sent with event
 */

export default class JSONBaseType {
  /**
   * Construct JSONBaseType
   * @param {emitter} emit - Emit a JSONStream event inside each specific parser
   */
  constructor (emit) {
    this.closed = false
    this.emit = emit
  }

  /**
   * Close this specific JSON type
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _close () {
    this.closed = true
  }

  /**
   * Process next character of this specific JSON type
   * @param  {number} code - Character's utf-8 code
   * @return {?SyntaxError} - Any throw error is returned
   */
  next (code) {
    throw new AbstractMethodError(this.constructor, this.next)
  }

  /**
   * Return JSON type name representation
   */
  get [Symbol.toStringTag] () {
    return '[JSON baseType]'
  }

  /**
   * Create a JSON's specific type according to received code
   * @param {number} code - Character's utf-8 code to determine which JSON type to create
   * @param {emitter} emit - Emit a JSONStream event inside each specific parser
   * @return {?JSONBaseType} - A JSON's specific type
   */
  static create (code, emit) {
    let type = null

    switch (code) {
      case QUOTATION_MARK:
        type = new JSONString(emit)
        break
      case HYPHEN_MINUS:
      case NUMBER_ZERO:
      case NUMBER_ONE:
      case NUMBER_TWO:
      case NUMBER_THREE:
      case NUMBER_FOUR:
      case NUMBER_FIVE:
      case NUMBER_SIX:
      case NUMBER_SEVEN:
      case NUMBER_EIGHT:
      case NUMBER_NINE:
        type = new JSONNumber(code, emit)
        break
      case BRACKET:
        type = new JSONArray(emit)
        break
      case LETTER_F:
        type = new JSONValue(code, FALSE_BUFFER, false, emit)
        break
      case LETTER_N:
        type = new JSONValue(code, NULL_BUFFER, null, emit)
        break
      case LETTER_T:
        type = new JSONValue(code, TRUE_BUFFER, true, emit)
        break
      case BRACES:
        type = new JSONObject(emit)
        break
    }

    return type
  }
}
