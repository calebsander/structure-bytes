"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const absolute_1 = require("./absolute");
/**
 * A type storing a string of UTF-8 characters, with no bound on length.
 * Behavior is undefined if string contains `\0` characters,
 * and no errors will be thrown when writing an invalid string.
 *
 * Example:
 * ````javascript
 * let type = new sb.StringType
 * ````
 */
class StringType extends absolute_1.default {
    static get _value() {
        return 0x41;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 'abcdéf')
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert_1.default.instanceOf(value, String);
        buffer
            .addAll(bufferString.fromString(value))
            .add(0); //add a null byte to indicate end
    }
}
exports.default = StringType;
