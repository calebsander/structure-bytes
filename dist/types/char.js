"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharType = void 0;
const assert = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const read_util_1 = require("../lib/read-util");
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
        assert.isBuffer(buffer);
        assert.instanceOf(value, String);
        if (value.length !== 1)
            throw new Error('String must contain only 1 character');
        buffer.addAll(bufferString.fromString(value));
    }
    consumeValue(bufferOffset) {
        const { buffer, offset } = bufferOffset;
        const [value] = bufferString.toString(new Uint8Array(buffer, offset), 1);
        if (!value)
            throw new Error(read_util_1.NOT_LONG_ENOUGH);
        bufferOffset.offset += bufferString.fromString(value).byteLength;
        return value;
    }
}
exports.CharType = CharType;
