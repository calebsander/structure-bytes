"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
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
        assert.instanceOf(value, String);
        value = strint.normalize(value); //throws if value is invalid
        const bytes = [];
        if (!strint.eq(value, '0')) {
            while (strint.gt(value, '127') || strint.lt(value, '-128')) { //builds bytes in LE order
                const quotient = strint.div(value, strint.BYTE_SHIFT, true);
                const remainder = strint.sub(value, strint.mul(quotient, strint.BYTE_SHIFT));
                bytes.push(Number(remainder));
                value = quotient;
            }
            bytes.push(Number(value));
        }
        const byteBuffer = new Uint8Array(bytes.length);
        for (let i = bytes.length - 1, offset = 0; i >= 0; i--, offset++) { //write in reverse order to get BE
            byteBuffer[offset] = bytes[i]; //signed highest byte can be cast to unsigned byte without issue
        }
        buffer
            .addAll(flexInt.makeValueBuffer(bytes.length))
            .addAll(byteBuffer.buffer);
    }
    consumeValue(buffer, offset) {
        //tslint:disable-next-line:prefer-const
        let { value: bytes, length } = read_util_1.readFlexInt(buffer, offset);
        if (buffer.byteLength < offset + length + bytes)
            throw new Error(read_util_1.NOT_LONG_ENOUGH);
        const castBuffer = new Uint8Array(buffer, offset + length);
        let value;
        if (bytes) {
            value = `${new Int8Array(castBuffer)[0]}`;
            for (let byte = 1; byte < bytes; byte++) {
                value = strint.add(strint.mul(value, strint.BYTE_SHIFT), `${castBuffer[byte]}`);
            }
        }
        else
            value = '0';
        length += bytes;
        return { value, length };
    }
}
exports.BigIntType = BigIntType;
