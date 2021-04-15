"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const unsigned_1 = require("./unsigned");
/**
 * A type storing an 8-byte unsigned integer
 * (`0` to `18446744073709551615`).
 * Each value must be provided as a BigInt.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedLongType
 * ````
 */
class UnsignedLongType extends unsigned_1.default {
    static get _value() {
        return 0x14;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 12345678901234567890n)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert.instanceOf(value, BigInt);
        if (value !== BigInt.asUintN(64, value))
            throw new RangeError('Value out of range');
        const byteBuffer = new ArrayBuffer(8);
        new DataView(byteBuffer).setBigInt64(0, value);
        buffer.addAll(byteBuffer);
    }
    consumeValue(buffer, offset) {
        const length = 8;
        if (buffer.byteLength < offset + length)
            throw new Error(read_util_1.NOT_LONG_ENOUGH);
        return { value: new DataView(buffer, offset).getBigUint64(0), length };
    }
}
exports.UnsignedLongType = UnsignedLongType;
