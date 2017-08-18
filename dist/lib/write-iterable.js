"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const flexInt = require("./flex-int");
const growable_buffer_1 = require("./growable-buffer");
const pointers_1 = require("./pointers");
/**
 * Writes any iterable value to the buffer.
 * Used by ArrayType and SetType.
 * Appends value bytes to a {@link GrowableBuffer} according to the type.
 * @param {Type<type>} type The type to use to write individual elements
 * @param {GrowableBuffer} buffer The buffer to which to append
 * @param {Iterable<type>} value The value to write
 * @param {number} length The number of elements in <tt>value</tt>
 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
*/
exports.default = ({ type, buffer, value, length, root }) => {
    assert_1.default.instanceOf(buffer, growable_buffer_1.default);
    buffer.addAll(flexInt.makeValueBuffer(length));
    for (const instance of value)
        type.writeValue(buffer, instance, false);
    pointers_1.setPointers({ buffer, root });
};
