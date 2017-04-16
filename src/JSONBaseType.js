'use strict'

// Internal
import JSONArray from './JSONArray' // TODO
import JSONValue from './JSONValue' // TODO
import JSONNumber from './JSONNumber' // TODO
import JSONObject from './JSONObject' // TODO
import JSONString from './JSONString' // TODO
import { AbstractMethodError } from './util/error'

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
    this.ended = false
    this.emit = emit
  }

  /**
   * Close this specific JSON type
   * @return {?SyntaxError} - Any throw error is returned
   * @protected
   */
  _close () {
    throw new AbstractMethodError(this.constructor, this.next)
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
    // TODO
  }
}
