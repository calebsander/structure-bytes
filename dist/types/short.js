"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortType = void 0;
const assert = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const str_to_num_1 = require("../lib/str-to-num");
const integer_1 = require("./integer");
const readShort = read_util_1.readNumber({ type: Int16Array, func: 'getInt16' });
/**
 * A type storing a 2-byte signed integer (`-32768` to `32767`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.ShortType
 * ````
 */
class ShortType extends integer_1.default {
    static get _value() {
        return 0x02;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, -12345) //or '-12345'
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
        assert.integer(value);
        assert.between(-32768, value, 32768, 'Value out of range');
        const byteBuffer = new ArrayBuffer(2);
        new DataView(byteBuffer).setInt16(0, value);
        buffer.addAll(byteBuffer);
    }
    consumeValue(buffer, offset) {
        return readShort(buffer, offset);
    }
}
exports.ShortType = ShortType;
