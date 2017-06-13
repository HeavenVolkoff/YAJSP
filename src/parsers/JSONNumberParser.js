'use strict'

import { isWhiteSpace } from './util/misc'
import JSONBaseParser from './JSONBaseParser'
import { ZERO,
         ONE,
         TWO,
         THREE,
         FOUR,
         FIVE,
         SIX,
         SEVEN,
         EIGHT,
         NINE,
         DOT,
         COMMA,
         LOWERCASE_E,
         UPPERCASE_E,
         HYPHEN_MINUS } from '../util/constants' // prettier-ignore

const NO_MODE = 0
const DOT_MODE = 1
const ZERO_MODE = 2
const EXPOENT_MODE = 3

/**
 * JSONNumber
 * Attention: There are no delimiters to mark the begin or end of a JSONNumber.
 * Thus there are some edge cases that require the addition of a synthetic delimiter,
 * in order to ensure that the JSONNumber is correctly closed.
 * When needed the synthetic delimiter should be a SPACE (\u0020).
 */
export default class JSONNumberParser extends JSONBaseParser {
  /**
   * Create JSONNumber
   * @param  {number} firstDigit - First digit
   * @param  {emitter} emit - Emit a JSONStream (value) event
   */
  constructor (emit) {
    super(emit)
    this.value = ''
    this.mode = NO_MODE
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
    // In case of attempt to add a char after parser was closed
    if (this.ended) {
      return new SyntaxError(
        `Unexpected token: ${String.fromCharCode(code)}, after ${this} end.`
      )
    }

    if (isWhiteSpace(code) || code === COMMA) {
      return this._close('value', this.value)
    }

    const mode = this.mode
    switch (code) {
      case LOWERCASE_E:
      case UPPERCASE_E:
        if (mode === EXPOENT_MODE) {
          return new SyntaxError(
            `Unexpected token: ${String.fromCharCode(code)} at ${this}`
          )
        }

        this.mode = EXPOENT_MODE
        break
      case DOT:
        if (mode === DOT_MODE || mode === EXPOENT_MODE) {
          return new SyntaxError(
            `Unexpected token: ${String.fromCharCode(code)} at ${this}`
          )
        }

        this.value += '.'
        break
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
        if (mode === ZERO_MODE) {
          return new SyntaxError(
            `Unexpected token: ${String.fromCharCode(code)} at ${this}`
          )
        }

        this.value += code
    }
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
