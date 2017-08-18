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
 * @extends Type
 * @inheritdoc
 */
class BigIntType extends integer_1.default {
    static get _value() {
        return 0x05;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
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
