"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64 = require("base64-js");
const VERSION = 12;
const VERSION_BYTES = 2;
const VERSION_BUFFER = new ArrayBuffer(VERSION_BYTES);
new DataView(VERSION_BUFFER).setUint16(0, VERSION);
/**
 * A base64 representation of the `structure-types`
 * binary format specification version.
 * Used in type signature strings.
 */
exports.VERSION_STRING = base64.fromByteArray(new Uint8Array(VERSION_BUFFER));
