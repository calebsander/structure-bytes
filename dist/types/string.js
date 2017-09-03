"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const growable_buffer_1 = require("../lib/growable-buffer");
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
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 'abcdéf')
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, String);
        buffer
            .addAll(bufferString.fromString(value))
            .add(0); //add a null byte to indicate end
    }
}
exports.default = StringType;
