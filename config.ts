import * as base64 from 'base64-js'

const VERSION = 11
const VERSION_BYTES = 2
const VERSION_BUFFER = new ArrayBuffer(VERSION_BYTES)
new DataView(VERSION_BUFFER).setUint16(0, VERSION)
//Convert version number into string (used in type signatures)
export const VERSION_STRING = base64.fromByteArray(new Uint8Array(VERSION_BUFFER))