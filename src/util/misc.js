'use strict'

import { SPACE, NEW_LINE, HORIZONTAL_TAB, CARRIAGE_RETURN } from './constants'

export const nextPowerOfTwo = num => {
  let n = (num | 0) - 1
  n = n | (n >> 1)
  n = n | (n >> 2)
  n = n | (n >> 4)
  n = n | (n >> 8)
  n = n | (n >> 16)
  return n + 1
}

export const isWhiteSpace = code =>
  code === SPACE ||
  code === NEW_LINE ||
  code === HORIZONTAL_TAB ||
  code === CARRIAGE_RETURN
