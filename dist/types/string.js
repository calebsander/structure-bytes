"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const growable_buffer_1 = require("../lib/growable-buffer");
const absolute_1 = require("./absolute");
/**
 * A type storing a string of UTF-8 characters, with no bound on length
 * @extends Type
 * @inheritdoc
 */
class StringType extends absolute_1.default {
    static get _value() {
        return 0x41;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, String);
        const valueBuffer = bufferString.fromString(value);
        buffer.addAll(valueBuffer);
        buffer.add(0); //add a null byte to indicate end
    }
}
exports.default = StringType;
