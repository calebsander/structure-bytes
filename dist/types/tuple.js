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
 *
 * Example:
 * ````javascript
 * //For storing a 3x3 matrix
 * //This represents values just as efficiently
 * //as a single tuple with 9 elements
 * let type = new sb.TupleType({
 *   type: new sb.TupleType({
 *     type: new sb.FloatType,
 *     length: 3
 *   }),
 *   length: 3
 * })
 * ````
 *
 * @param E The type of each element in the tuple
 */
class TupleType extends absolute_1.default {
    /**
     * @param type A [[Type]] that can write each element in the tuple
     * @param length The number of elements in the tuple.
     * Must be at most 255.
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
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, [
     *   [1, 2, 3],
     *   [4, 5, 6],
     *   [7, 8, 9]
     * ])
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, Array);
        assert_1.default(value.length === this.length, 'Length does not match: expected ' + String(this.length) + ' but got ' + String(value.length));
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
