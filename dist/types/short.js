"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const str_to_num_1 = require("../lib/str-to-num");
const integer_1 = require("./integer");
/**
 * A type storing a 2-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class ShortType extends integer_1.default {
    static get _value() {
        return 0x02;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        const convertedValue = str_to_num_1.default(value);
        if (convertedValue !== undefined)
            value = convertedValue;
        assert_1.default.integer(value);
        assert_1.default.between(-32768, value, 32768, 'Value out of range');
        const byteBuffer = new ArrayBuffer(2);
        new DataView(byteBuffer).setInt16(0, value);
        buffer.addAll(byteBuffer);
    }
}
exports.default = ShortType;