"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const growable_buffer_1 = require("../lib/growable-buffer");
const absolute_1 = require("./absolute");
/**
 * A type storing a single UTF-8 character
 * @extends Type
 * @inheritdoc
 */
class CharType extends absolute_1.default {
    static get _value() {
        return 0x40;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (must be only 1 character long)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, String);
        assert_1.default(value.length === 1, 'String must contain only 1 character');
        buffer.addAll(bufferString.fromString(value));
    }
}
exports.default = CharType;
