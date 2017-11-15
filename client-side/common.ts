import assert from '../lib/assert'
import Type from '../types/type'

assert(typeof ArrayBuffer !== 'undefined', 'ArrayBuffer not supported')
assert(typeof fetch !== 'undefined', 'fetch() not supported')
assert(typeof Map !== 'undefined', 'Map not supported')
assert(typeof Set !== 'undefined', 'Set not supported')
assert(typeof Symbol !== 'undefined', 'Symbol not supported')
assert(typeof Uint8Array !== 'undefined', 'Uint8Array not supported')
assert(typeof WeakMap !== 'undefined', 'WeakMap not supported')

export * from '../types'
export * from '../recursive-registry'
export {assert}
export {Type}