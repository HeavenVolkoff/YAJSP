'use strict'

import JSONBaseParser from './JSONBaseParser'
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
  HYPHEN_MINUS
} from '../util/constants'

/**
 * JSONNumber
 * Attention: There are no delimiters to mark the begin or end of a JSONNumber.
 * Thus there are some edge cases that require the addition of a synthetic delimiter,
 * in order to ensure that the JSONNumber is correctly closed.
 * When needed the synthetic should be a SPACE (\u0020).
 */
export default class JSONNumberParser extends JSONBaseParser {
  /**
   * Create JSONNumber
   * @param  {number} firstDigit - First digit
   * @param  {emitter} emit - Emit a JSONStream (value) event
   */
  constructor (firstDigit, emit) {
    super(emit)
    this.value = firstDigit
  }

  /**
   * Check if code represent the begin of the parsed type
   * @param  {number} code - Character's utf-8 code
   * @return {Boolean} - Whether is a valid beginning code or not
   */
  _isOpenDelimiter (code) {
    return (
      code === ZERO ||
      code === ONE ||
      code === TWO ||
      code === THREE ||
      code === FOUR ||
      code === FIVE ||
      code === SIX ||
      code === SEVEN ||
      code === EIGHT ||
      code === NINE ||
      code === HYPHEN_MINUS
    )
  }

  next (code) {
    // TODO
  }

  /**
   * Object string representation
   * @return {string} - Object string representation
   * @override
   */
  get [Symbol.toStringTag] () {
    return '[JSON number]'
  }
}
