"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
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
     * Appends value bytes to an [[AppendableBuffer]] according to the type
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
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
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
        const byteBuffer = new Uint8Array(bytes.length);
        for (let i = bytes.length - 1, offset = 0; i >= 0; i--, offset++) {
            byteBuffer[offset] = bytes[i]; //signed highest byte can be cast to unsigned byte without issue
        }
        buffer
            .addAll(flexInt.makeValueBuffer(bytes.length))
            .addAll(byteBuffer.buffer);
    }
    consumeValue(buffer, offset) {
        const lengthInt = read_util_1.readFlexInt(buffer, offset);
        const bytes = lengthInt.value;
        let { length } = lengthInt;
        assert_1.default(buffer.byteLength >= offset + length + bytes, read_util_1.NOT_LONG_ENOUGH);
        const castBuffer = new Uint8Array(buffer, offset + length);
        let value;
        if (bytes) {
            value = String(castBuffer[0] << 24 >> 24); //convert unsigned to signed
            for (let byte = 1; byte < bytes; byte++) {
                value = strint.add(strint.mul(value, strint.BYTE_SHIFT), String(castBuffer[byte]));
            }
        }
        else
            value = '0';
        length += bytes;
        return { value, length };
    }
}
exports.default = BigIntType;
