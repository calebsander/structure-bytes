"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const strint = require("../lib/strint");
const unsigned_1 = require("./unsigned");
/**
 * A type storing an arbitrary precision unsigned integer.
 * Each written value has its own number of bytes of precision.
 * @extends Type
 * @inheritdoc
 */
class BigUnsignedIntType extends unsigned_1.default {
    static get _value() {
        return 0x15;
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
        assert_1.default(!strint.isNegative(value), 'Value out of range');
        const bytes = [];
        if (!strint.eq(value, '0')) {
            while (strint.ge(value, strint.BYTE_SHIFT)) {
                const [quotient, remainder] = strint.quotientRemainderPositive(value, strint.BYTE_SHIFT);
                bytes.push(Number(remainder));
                value = quotient;
            }
            bytes.push(Number(value));
        }
        buffer.addAll(flexInt.makeValueBuffer(bytes.length));
        const byteBuffer = new ArrayBuffer(bytes.length);
        const castBuffer = new Uint8Array(byteBuffer);
        let offset = 0;
        for (let i = bytes.length - 1; i >= 0; i--, offset++)
            castBuffer[offset] = bytes[i]; //write in reverse order to get BE
        buffer.addAll(byteBuffer);
    }
}
exports.default = BigUnsignedIntType;
