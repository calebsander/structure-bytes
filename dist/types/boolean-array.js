"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanArrayType = void 0;
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const write_util_1 = require("../lib/write-util");
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
     * Appends value bytes to an [[AppendableBuffer]] according to the type
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
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert.instanceOf(value, Array);
        buffer.addAll(flexInt.makeValueBuffer(value.length));
        write_util_1.writeBooleans(buffer, value);
    }
    consumeValue(buffer, offset) {
        const readCount = read_util_1.readFlexInt(buffer, offset);
        const count = readCount.value;
        let { length } = readCount;
        const booleans = read_util_1.readBooleans({ buffer, offset: offset + length, count });
        const { value } = booleans;
        length += booleans.length;
        return { value, length };
    }
}
exports.BooleanArrayType = BooleanArrayType;
