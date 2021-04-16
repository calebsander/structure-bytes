"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppendableBuffer = void 0;
/**
 * A "writable" interface, sufficient
 * to be able to write type and value bytes.
 * Implemented by [[GrowableBuffer]], as well as
 * [[AppendableStream]] (a wrapper around a writable stream).
 * All methods can be chained, e.g.
 * ````javascript
 * let gb = new GrowableBuffer
 * gb
 *   .add(1).add(2)
 *   .addAll(new Uint8Array([3, 4, 5]))
 *   .pause()
 *     .add(0)
 *     .reset()
 *   .resume()
 * console.log(new Uint8Array(gb.toBuffer())) //Uint8Array [ 1, 2, 3, 4, 5 ]
 * ````
 */
class AppendableBuffer {
}
exports.AppendableBuffer = AppendableBuffer;
