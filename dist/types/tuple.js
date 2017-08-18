"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const pointers_1 = require("../lib/pointers");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a fixed-length array of values of the same type.
 * The length must be at most 255.
 * @example
 * //For storing 5 4-byte unsigned integers
 * let type = new sb.TupleType({type: new sb.UnsignedIntType, length: 5})
 * @extends Type
 * @inheritdoc
 */
class TupleType extends absolute_1.default {
    /**
     * @param {{type, length}} params
     * @param {Type} params.type The type of each element in the tuple
     * @param {number} params.length The number of elements in the tuple.
     * Must fit in a 1-byte unsigned integer.
     */
    constructor({ type, length }) {
        super();
        assert_1.default.instanceOf(type, abstract_1.default);
        assert_1.default.byteUnsignedInteger(length);
        this.type = type;
        this.length = length;
    }
    static get _value() {
        return 0x50;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
            buffer.add(this.length);
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {type[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, [10, 5, 101, 43, 889])
     */
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, Array);
        assert_1.default(value.length === this.length, 'Length does not match: expected ' + String(this.length) + ' but got ' + value.length);
        for (const instance of value)
            this.type.writeValue(buffer, instance, false);
        pointers_1.setPointers({ buffer, root });
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.type.equals(otherType.type)
            && this.length === otherType.length;
    }
}
exports.default = TupleType;
