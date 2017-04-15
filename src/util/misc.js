'use strict'

export const nextPowerOfTwo = num => {
  let n = (num | 0) - 1
  n = n | (n >> 1)
  n = n | (n >> 2)
  n = n | (n >> 4)
  n = n | (n >> 8)
  n = n | (n >> 16)
  return n + 1
}
