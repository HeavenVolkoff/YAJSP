'use strict'

export const NUMBER_ZERO = 48
export const NUMBER_ONE = 49
export const NUMBER_TWO = 50
export const NUMBER_THREE = 51
export const NUMBER_FOUR = 52
export const NUMBER_FIVE = 53
export const NUMBER_SIX = 54
export const NUMBER_SEVEN = 55
export const NUMBER_EIGHT = 56
export const NUMBER_NINE = 57

export const SPACE = 32
export const BRACES = 123
export const SOLIDUS = 47
export const BRACKET = 91
export const FORMFEED = 12
export const NEW_LINE = 10
export const BACKSPACE = 8
export const HYPHEN_MINUS = 45
export const QUOTATION_MARK = 34
export const HORIZONTAL_TAB = 9
export const REVERSE_SOLIDUS = 92
export const CARRIAGE_RETURN = 13

export const LOWERCASE_A = 97
export const LOWERCASE_B = 98
export const LOWERCASE_F = 102
export const LOWERCASE_N = 110
export const LOWERCASE_R = 114
export const LOWERCASE_T = 116
export const LOWERCASE_U = 117

export const UPPERCASE_A = 65
export const UPPERCASE_F = 70

let nullBuff = null
let trueBuff = null
let falseBuff = null
export const VALUE = Object.create(null, {
  NULL: {
    get: () => (nullBuff === null ? (nullBuff = Buffer.from('null')) : nullBuff)
  },
  TRUE: {
    get: () => (trueBuff === null ? (trueBuff = Buffer.from('true')) : trueBuff)
  },
  FALSE: {
    get: () =>
      (falseBuff === null ? (falseBuff = Buffer.from('false')) : falseBuff)
  }
})
