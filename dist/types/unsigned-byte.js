"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsignedByteType = void 0;
const assert = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const str_to_num_1 = require("../lib/str-to-num");
const unsigned_1 = require("./unsigned");
const readByte = read_util_1.readNumber({ type: Uint8Array, func: 'getUint8' });
/**
 * A type storing a 1-byte unsigned integer (`0` to `255`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedByteType
 * ````
 */
class UnsignedByteType extends unsigned_1.default {
    static get _value() {
        return 0x11;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 123) //or '123'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert.isBuffer(buffer);
        const convertedValue = str_to_num_1.default(value);
        if (convertedValue !== undefined)
            value = convertedValue;
        assert.integer(value);
        assert.between(0, value, 0x100, 'Value out of range');
        buffer.add(value);
    }
    consumeValue(bufferOffset) {
        return readByte(bufferOffset);
    }
}
exports.UnsignedByteType = UnsignedByteType;
