"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const absolute_1 = require("./absolute");
/**
 * A type storing a single unicode character
 *
 * Example:
 * ````javascript
 * let type = new sb.CharType
 * ````
 */
class CharType extends absolute_1.default {
    static get _value() {
        return 0x40;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 'é') //takes up 2 bytes in UTF-8
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert_1.default.instanceOf(value, String);
        assert_1.default(value.length === 1, 'String must contain only 1 character');
        buffer.addAll(bufferString.fromString(value));
    }
}
exports.default = CharType;
