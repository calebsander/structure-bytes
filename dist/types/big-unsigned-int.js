"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const strint = require("../lib/strint");
const unsigned_1 = require("./unsigned");
/**
 * A type storing an arbitrary precision unsigned integer.
 * Each written value has its own number of bytes of precision.
 * Values must be provided as base-10 strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.BigUnsignedIntType
 * ````
 */
class BigUnsignedIntType extends unsigned_1.default {
    static get _value() {
        return 0x15;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, '1') //takes up 2 bytes
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, '12345678901234567890') //takes up 9 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert.instanceOf(value, String);
        if (strint.isNegative(value))
            throw new RangeError('Value out of range');
        const bytes = [];
        if (!strint.eq(value, '0')) { //if value is 0, avoid adding a 0 byte
            while (strint.ge(value, strint.BYTE_SHIFT)) { //builds bytes in LE order
                const [quotient, remainder] = strint.quotientRemainderPositive(value, strint.BYTE_SHIFT);
                bytes.push(Number(remainder));
                value = quotient;
            }
            bytes.push(Number(value));
        }
        const byteBuffer = new Uint8Array(bytes.length);
        for (let i = bytes.length - 1, offset = 0; i >= 0; i--, offset++)
            byteBuffer[offset] = bytes[i]; //write in reverse order to get BE
        buffer
            .addAll(flexInt.makeValueBuffer(bytes.length))
            .addAll(byteBuffer.buffer);
    }
    consumeValue(buffer, offset) {
        const lengthInt = read_util_1.readFlexInt(buffer, offset);
        const bytes = lengthInt.value;
        let { length } = lengthInt;
        if (buffer.byteLength < offset + length + bytes)
            throw new Error(read_util_1.NOT_LONG_ENOUGH);
        const castBuffer = new Uint8Array(buffer, offset + length);
        let value = '0';
        for (let byte = 0; byte < bytes; byte++) {
            value = strint.add(strint.mul(value, strint.BYTE_SHIFT), `${castBuffer[byte]}`);
        }
        length += bytes;
        return { value, length };
    }
}
exports.BigUnsignedIntType = BigUnsignedIntType;
