import * as base64 from 'base64-js'

const VERSION = 11
const VERSION_BYTES = 2
const VERSION_BUFFER = new ArrayBuffer(VERSION_BYTES)
new DataView(VERSION_BUFFER).setUint16(0, VERSION)
/**
 * A base64 representation of the `structure-types`
 * binary format specification version.
 * Used in type signature strings.
 */
export const VERSION_STRING = base64.fromByteArray(new Uint8Array(VERSION_BUFFER))