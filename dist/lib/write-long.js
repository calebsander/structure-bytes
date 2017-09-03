"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const growable_buffer_1 = require("./growable-buffer");
const strint = require("./strint");
const LONG_MAX = '9223372036854775807', LONG_MIN = '-9223372036854775808';
/**
 * Writes the given string value as a signed long (8 bytes)
 * @param buffer The buffer to which to append
 * @param value The value to write (a numeric string)
 */
exports.default = (buffer, value) => {
    assert_1.default.instanceOf(buffer, growable_buffer_1.default);
    assert_1.default.instanceOf(value, String);
    assert_1.default(!(strint.gt(value, LONG_MAX) || strint.lt(value, LONG_MIN)), 'Value out of range');
    const upper = strint.div(value, strint.LONG_UPPER_SHIFT, true); //get upper signed int
    const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)); //get lower unsigned int
    const byteBuffer = new ArrayBuffer(8);
    const dataView = new DataView(byteBuffer);
    dataView.setInt32(0, Number(upper));
    dataView.setUint32(4, Number(lower));
    buffer.addAll(byteBuffer);
};
