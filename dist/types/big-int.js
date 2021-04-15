"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const integer_1 = require("./integer");
/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
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
     * type.writeValue(buffer, -1n) //takes up 2 bytes
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, 12345678901234567890n) //takes up 10 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert.instanceOf(value, BigInt);
        const bytes = [];
        let signBit = 0n;
        //Build bytes in LE order. Continue until sign-extended bytes match the value.
        //If a positive number has a 1 in the highest bit, another 0 byte is needed.
        //If a negative number has a 0 in the highest bit, another -1 byte is needed.
        while (value !== signBit) {
            const byte = BigInt.asIntN(8, value);
            bytes.push(Number(byte) & 0xFF);
            signBit = byte >> 8n;
            value >>= 8n;
        }
        const byteLength = bytes.length;
        buffer.addAll(flexInt.makeValueBuffer(byteLength));
        for (let i = byteLength - 1; i >= 0; i--) { //write in reverse order to get BE
            buffer.add(bytes[i]);
        }
    }
    consumeValue(buffer, offset) {
        //tslint:disable-next-line:prefer-const
        let { value: bytes, length } = read_util_1.readFlexInt(buffer, offset);
        if (buffer.byteLength < offset + length + bytes)
            throw new Error(read_util_1.NOT_LONG_ENOUGH);
        let value = 0n;
        for (const byte of new Uint8Array(buffer, offset + length, bytes)) {
            value = value << 8n | BigInt(byte);
        }
        //Sign-extend the read bytes
        value = BigInt.asIntN(bytes << 3, value);
        length += bytes;
        return { value, length };
    }
}
exports.BigIntType = BigIntType;
