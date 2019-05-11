if (typeof ArrayBuffer === 'undefined') throw new Error('ArrayBuffer not supported')
if (typeof fetch === 'undefined') throw new Error('fetch() not supported')
if (typeof Map === 'undefined') throw new Error('Map not supported')
if (typeof Set === 'undefined') throw new Error('Set not supported')
if (typeof Uint8Array === 'undefined') throw new Error('Uint8Array not supported')
if (typeof WeakMap === 'undefined') throw new Error('WeakMap not supported')

export * from '../types'
export * from '../recursive-registry'