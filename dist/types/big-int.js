"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const strint = require("../lib/strint");
const integer_1 = require("./integer");
/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
 * Values must be provided as base-10 strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.BigIntType
 * ````
 */
class BigIntType extends integer_1.default {
    static get _value() {
        return 0x05;
    }
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, '-1') //takes up 2 bytes
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, '12345678901234567890') //takes up 10 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, String);
        value = strint.normalize(value); //throws if value is invalid
        const bytes = [];
        if (!strint.eq(value, '0')) {
            while (strint.gt(value, '127') || strint.lt(value, '-128')) {
                const quotient = strint.div(value, strint.BYTE_SHIFT, true);
                const remainder = strint.sub(value, strint.mul(quotient, strint.BYTE_SHIFT));
                bytes.push(Number(remainder));
                value = quotient;
            }
            bytes.push(Number(value));
        }
        buffer.addAll(flexInt.makeValueBuffer(bytes.length));
        const byteBuffer = new ArrayBuffer(bytes.length);
        const dataView = new DataView(byteBuffer);
        for (let i = bytes.length - 2, offset = 1; i >= 0; i--, offset++) {
            dataView.setUint8(offset, bytes[i]);
        }
        if (bytes.length)
            dataView.setInt8(0, bytes[bytes.length - 1]); //highest byte is signed so it must be treated separately
        buffer.addAll(byteBuffer);
    }
}
exports.default = BigIntType;
