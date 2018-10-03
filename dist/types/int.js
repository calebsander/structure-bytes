"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const str_to_num_1 = require("../lib/str-to-num");
const integer_1 = require("./integer");
const readInt = read_util_1.readNumber({ type: Int32Array, func: 'getInt32' });
/**
 * A type storing a 2-byte signed integer (`-2147483648` to `2147483647`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.IntType
 * ````
 */
class IntType extends integer_1.default {
    static get _value() {
        return 0x03;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, -1234567890) //or '-1234567890'
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
        assert_1.default.between(-2147483648, value, 2147483648, 'Value out of range');
        const byteBuffer = new ArrayBuffer(4);
        new DataView(byteBuffer).setInt32(0, value);
        buffer.addAll(byteBuffer);
    }
    consumeValue(buffer, offset) {
        return readInt(buffer, offset);
    }
}
exports.IntType = IntType;
