"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flexInt = require("./flex-int");
/**
 * Writes any iterable value to the buffer.
 * Used by [[ArrayType]] and [[SetType]].
 * Appends value bytes to an [[AppendableBuffer]] according to the type.
 * @param type The type to use to write individual elements
 * @param buffer The buffer to which to append
 * @param value The value to write
 * @param length The number of elements in `value`
 * @throws If the value doesn't match the type, e.g. `new sb.ArrayType().writeValue(buffer, 23)`
 */
exports.default = ({ type, buffer, value, length }) => {
    buffer.addAll(flexInt.makeValueBuffer(length));
    for (const instance of value)
        type.writeValue(buffer, instance);
};
