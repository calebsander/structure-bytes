"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const flexInt = require("./flex-int");
const growable_buffer_1 = require("./growable-buffer");
/**
 * Writes any iterable value to the buffer.
 * Used by [[ArrayType]] and [[SetType]].
 * Appends value bytes to a [[GrowableBuffer]] according to the type.
 * @param type The type to use to write individual elements
 * @param buffer The buffer to which to append
 * @param value The value to write
 * @param length The number of elements in `value`
 * @throws If the value doesn't match the type, e.g. `new sb.ArrayType().writeValue(buffer, 23)`
 */
exports.default = ({ type, buffer, value, length }) => {
    assert_1.default.instanceOf(buffer, growable_buffer_1.default);
    buffer.addAll(flexInt.makeValueBuffer(length));
    for (const instance of value)
        type.writeValue(buffer, instance);
};
