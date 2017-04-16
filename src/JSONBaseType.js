'use strict'

/**
 * Callback for emitting an event
 * @callback emitter
 * @param {string} name - Event name
 * @param {*} data - Data sent with event
 */

// Internal
import JSONArray from './JSONArray' // TODO
import JSONValue from './JSONValue' // TODO
import JSONNumber from './JSONNumber' // TODO
import JSONObject from './JSONObject' // TODO
import JSONString from './JSONString' // TODO
import { AbstractMethodError } from './util/error'
import {
  ZERO,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  LOWERCASE_F,
  LOWERCASE_N,
  LOWERCASE_T,
  BRACES,
  BRACKET,
  HYPHEN_MINUS,
  QUOTATION_MARK,
  NULL_BUFFER,
  TRUE_BUFFER,
  FALSE_BUFFER
} from './constants'

export default class JSONBaseType {
  /**
   * Construct JSONBaseType
   * @param {emitter} emit - Emit a JSONStream event inside each specific parser
   */
  constructor (emit, eventType) {
    this.emit = emit
    this.closed = false
    this.eventType = eventType
  }

  /**
   * Close this specific JSON type
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _close (value) {
    this.closed = true
    this.emit(this.eventType, value)
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
      case ZERO:
      case ONE:
      case TWO:
      case THREE:
      case FOUR:
      case FIVE:
      case SIX:
      case SEVEN:
      case EIGHT:
      case NINE:
        type = new JSONNumber(code, emit)
        break
      case BRACKET:
        type = new JSONArray(emit)
        break
      case LOWERCASE_F:
        type = new JSONValue(code, FALSE_BUFFER, false, emit)
        break
      case LOWERCASE_N:
        type = new JSONValue(code, NULL_BUFFER, null, emit)
        break
      case LOWERCASE_T:
        type = new JSONValue(code, TRUE_BUFFER, true, emit)
        break
      case BRACES:
        type = new JSONObject(emit)
        break
    }

    return type
  }
}
