'use strict'

import JSONBaseType from './JSONBaseType'
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
  NUMBER_NINE
} from './util/constant'

/**
 * JSONNumber
 * Attention: There are no delimiters to mark the begin or end of a JSONNumber.
 * Thus there are some edge cases that require the addition of a synthetic delimiter,
 * in order to ensure that the JSONNumber is correctly closed.
 * When needed the synthetic should be a SPACE (\u0020).
 */
export default class JSONNumber extends JSONBaseType {
  /**
   * Create JSONNumber
   * @param  {number} firstDigit - First digit
   * @param  {emitter} emit - Emit a JSONStream (value) event
   */
  constructor (firstDigit, emit) {
    super(emit)
    this.value = firstDigit
  }

  next (code) {}

  /**
   * Object string representation
   * @return {string} - Object string representation
   * @override
   */
  get [Symbol.toStringTag] () {
    return '[JSON number]'
  }
}
