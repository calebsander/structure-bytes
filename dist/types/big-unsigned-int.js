"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
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
        const byteBuffer = new ArrayBuffer(bytes.length);
        const castBuffer = new Uint8Array(byteBuffer);
        let offset = 0;
        for (let i = bytes.length - 1; i >= 0; i--, offset++)
            castBuffer[offset] = bytes[i]; //write in reverse order to get BE
        buffer
            .addAll(flexInt.makeValueBuffer(bytes.length))
            .addAll(byteBuffer);
    }
}
exports.default = BigUnsignedIntType;
