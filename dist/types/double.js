"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const str_to_num_1 = require("../lib/str-to-num");
const floating_1 = require("./floating");
/**
 * A type storing an 8-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
class DoubleType extends floating_1.default {
    static get _value() {
        return 0x21;
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
        assert_1.default.instanceOf(value, Number);
        const byteBuffer = new ArrayBuffer(8);
        new DataView(byteBuffer).setFloat64(0, value);
        buffer.addAll(byteBuffer);
    }
}
exports.default = DoubleType;
