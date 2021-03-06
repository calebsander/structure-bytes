"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigUnsignedIntType = void 0;
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const unsigned_1 = require("./unsigned");
/**
 * A type storing an arbitrary precision unsigned integer.
 * Each written value has its own number of bytes of precision.
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
     * type.writeValue(buffer, 1n) //takes up 2 bytes
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, 12345678901234567890n) //takes up 9 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert.isBuffer(buffer);
        assert.instanceOf(value, BigInt);
        if (value < 0n)
            throw new RangeError('Value out of range');
        const bytes = [];
        while (value) {
            bytes.push(Number(BigInt.asUintN(8, value)));
            value >>= 8n;
        }
        const byteLength = bytes.length;
        buffer.addAll(flexInt.makeValueBuffer(byteLength));
        for (let i = bytes.length - 1; i >= 0; i--) { //write in reverse order to get BE
            buffer.add(bytes[i]);
        }
    }
    consumeValue(bufferOffset) {
        const byteLength = read_util_1.readFlexInt(bufferOffset);
        const bytes = read_util_1.readBytes(bufferOffset, byteLength);
        let value = 0n;
        for (const byte of bytes)
            value = value << 8n | BigInt(byte);
        return value;
    }
}
exports.BigUnsignedIntType = BigUnsignedIntType;
