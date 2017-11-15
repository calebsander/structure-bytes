"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const str_to_num_1 = require("../lib/str-to-num");
const unsigned_1 = require("./unsigned");
const readShort = read_util_1.readNumber({ type: Uint16Array, func: 'getUint16' });
/**
 * A type storing a 2-byte unsigned integer (`0` to `65535`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedShortType
 * ````
 */
class UnsignedShortType extends unsigned_1.default {
    static get _value() {
        return 0x12;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 12345) //or '12345'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        const convertedValue = str_to_num_1.default(value);
        if (convertedValue !== undefined)
            value = convertedValue;
        assert_1.default.integer(value);
        assert_1.default.between(0, value, 0x10000, 'Value out of range');
        const byteBuffer = new ArrayBuffer(2);
        new DataView(byteBuffer).setUint16(0, value);
        buffer.addAll(byteBuffer);
    }
    consumeValue(buffer, offset) {
        return readShort(buffer, offset);
    }
}
exports.default = UnsignedShortType;
