"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
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
     * type.writeValue(buffer, octets.buffer)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert_1.default.instanceOf(value, ArrayBuffer);
        buffer
            .addAll(flexInt.makeValueBuffer(value.byteLength))
            .addAll(value);
    }
}
exports.default = OctetsType;
