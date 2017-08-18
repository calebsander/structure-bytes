"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const write_booleans_1 = require("../lib/write-booleans");
const absolute_1 = require("./absolute");
/**
 * A type storing a fixed-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link TupleType} for boolean arrays.
 * The length must be at most 255.
 * @see BooleanType
 * @see TupleType
 * @extends Type
 * @inheritdoc
 */
class BooleanTupleType extends absolute_1.default {
    static get _value() {
        return 0x31;
    }
    /**
     * @param {number} length The number of {@link Boolean}s in each value of this type.
     * Must fit in a 1-byte unsigned integer.
     */
    constructor(length) {
        super();
        assert_1.default.byteUnsignedInteger(length);
        this.length = length;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            buffer.add(this.length);
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Boolean[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, Array);
        assert_1.default(value.length === this.length, 'Length does not match: expected ' + String(this.length) + ' but got ' + value.length);
        write_booleans_1.default(buffer, value);
    }
    equals(otherType) {
        return super.equals(otherType) && otherType.length === this.length;
    }
}
exports.default = BooleanTupleType;
