'use strict'

import { AbstractMethodError } from '../util/error'

const { defineProperty } = Object

const isResettable = Symbol('Resettable instance identifier')
const Resettable = _class => class Resettable extends _class {
  get [isResettable] () {
    return true
  }
  /**
   * Reset object
   * @return {Resettable} - The reset object
   */
  reset () {
    throw AbstractMethodError(this.constructor, this.reset)
  }
  static [Symbol.hasInstance] (instance) {
    return instance[isResettable]
  }
}

let resettableInterface = null
defineProperty(Resettable, 'interface', {
  get: () => {
    if (resettableInterface === null) resettableInterface = Resettable(Object)
    return resettableInterface
  }
})

export default Resettable
