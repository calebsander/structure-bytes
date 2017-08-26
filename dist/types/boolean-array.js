"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const write_booleans_1 = require("../lib/write-booleans");
const absolute_1 = require("./absolute");
/**
 * A type storing a variable-length array of `Boolean` values.
 * This type creates more efficient serializations than
 * `new sb.ArrayType(new sb.BooleanType)` for boolean arrays,
 * since it works with bits instead of whole bytes.
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanArrayType
 * ````
 */
class BooleanArrayType extends absolute_1.default {
    static get _value() {
        return 0x32;
    }
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, [false]) //takes up 2 bytes
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, new Array(100).fill(true)) //takes up 14 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(value, Array);
        buffer.addAll(flexInt.makeValueBuffer(value.length));
        write_booleans_1.default(buffer, value);
    }
}
exports.default = BooleanArrayType;
