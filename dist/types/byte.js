"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const str_to_num_1 = require("../lib/str-to-num");
const integer_1 = require("./integer");
/**
 * A type storing a 1-byte signed integer (`-128` to `127`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.ByteType
 * ````
 */
class ByteType extends integer_1.default {
    static get _value() {
        return 0x01;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, -123) //or '-123'
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
        assert_1.default.between(-128, value, 128, 'Value out of range');
        buffer.addAll(new Int8Array([value]).buffer);
    }
}
exports.default = ByteType;
