"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OctetsType = void 0;
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const read_util_1 = require("../lib/read-util");
const absolute_1 = require("./absolute");
/**
 * A type storing a variable-length array of bytes.
 * This is intended for data that
 * doesn't fit any other category,
 * e.g. the contents of a PNG file.
 *
 * Example:
 * ````javascript
 * let type = new sb.OctetsType
 * ````
 */
class OctetsType extends absolute_1.default {
    static get _value() {
        return 0x42;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * let octets = new Uint8Array([1, 2, 3, 4, 5])
     * type.writeValue(buffer, octets)
     * // or
     * type.writeValue(buffer, octets.buffer)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert.isBuffer(buffer);
        assert.instanceOf(value, [ArrayBuffer, Uint8Array]);
        buffer
            .addAll(flexInt.makeValueBuffer(value.byteLength))
            .addAll(value);
    }
    consumeValue(bufferOffset) {
        const octetsLength = read_util_1.readFlexInt(bufferOffset);
        const bytes = read_util_1.readBytes(bufferOffset, octetsLength);
        return growable_buffer_1.toArrayBuffer(bytes);
    }
}
exports.OctetsType = OctetsType;
