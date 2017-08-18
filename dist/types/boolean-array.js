"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const write_booleans_1 = require("../lib/write-booleans");
const absolute_1 = require("./absolute");
/**
 * A type storing a variable-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link ArrayType} for boolean arrays.
 * @see BooleanType
 * @extends Type
 * @inheritdoc
 */
class BooleanArrayType extends absolute_1.default {
    static get _value() {
        return 0x32;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Boolean[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(value, Array);
        buffer.addAll(flexInt.makeValueBuffer(value.length));
        write_booleans_1.default(buffer, value);
    }
}
exports.default = BooleanArrayType;
