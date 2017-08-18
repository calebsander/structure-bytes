"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const strint = require("../lib/strint");
const unsigned_1 = require("./unsigned");
const UNSIGNED_LONG_MAX = '18446744073709551615';
/**
 * A type storing an 8-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedLongType extends unsigned_1.default {
    static get _value() {
        return 0x14;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, String);
        assert_1.default(!(strint.gt(value, UNSIGNED_LONG_MAX) || strint.lt(value, '0')), 'Value out of range');
        const upper = strint.div(value, strint.LONG_UPPER_SHIFT); //get upper unsigned int
        const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)); //get lower unsigned int
        const byteBuffer = new ArrayBuffer(8);
        const dataView = new DataView(byteBuffer);
        dataView.setUint32(0, Number(upper));
        dataView.setUint32(4, Number(lower));
        buffer.addAll(byteBuffer);
    }
}
exports.default = UnsignedLongType;
