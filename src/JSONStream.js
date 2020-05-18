'use strict'

// Node
import { Writable } from 'stream'

// Internal
import { isWhiteSpace } from './util/misc'
import parseFirstCharacter from './parsers/ParserFactory'

export class JSONStream extends Writable {
  constructor () {
    super()

    /**
     * Root JSON type
     * Can be a: String; Number, Array, Object, true, false, null
     * @type {?JSONBaseType}
     */
    this.root = this

    /** @function init */
    this.next = this.init

    // Listen to finish event to assure JSON has correctly ended
    this.once('finish', this.onFinish)
  }

  /**
   * Assure JSON ended correctly, in case not emit error
   */
  onFinish () {
    const root = this.root
    if (root === null || !root.closed) {
      this.emit('error', new SyntaxError('Unexpected end of JSON input'))
    }
  }

  /**
   * Initialize JSONStream based on first received character
   * @param  {number} code - Character's utf-8 code
   * @return {?SyntaxError} - Any throw error is returned
   */
  init (code) {
    let root = this.root

    // In case root is already initialized redirect call to root.next
    if (root !== this) return root.next(code)

    // Ignore whitespace
    if (isWhiteSpace()) return

    root = parseFirstCharacter(code, (name, data) => this.emit(name, data))
    if (root === null) {
      return new SyntaxError(
        `Unexpected token ${String.fromCharCode(code)} at start of JSON input`
      )
    }

    this.root = root
    this.next = root.next
  }

  _write (chunk, _, done) {
    const root = this.root
    const next = this.next
    const length = chunk.length

    let i = -1
    let error = null
    while (++i < length && error !== null) error = next.call(root, chunk[i])

    done(error)
  }
}
