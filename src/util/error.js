'use strict'

/** Class representing a ExtendableError. */
class ExtendableError extends Error {
  /**
   * Create ExtendableError
   * @param  {string} message - Error message
   */
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Class representing a AbstractMethodError.
 * @extends ExtendableError
 */
export class AbstractMethodError extends ExtendableError {
  /**
   * Create AbstractMethodError.
   * @param  {function} _constructor - Class contructor function
   * @param  {function} _method - Abstract method function
   */
  constructor (_constructor, _method) {
    super(
      `.${_method.name}() is a abstract method of class ${_constructor.name} and should be overriden.`
    )
  }
}
