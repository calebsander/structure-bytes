"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a fixed-length array of values of the same type.
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
 * @param READ_E The type of each element
 * in the read tuple
 */
class TupleType extends absolute_1.default {
    /**
     * @param type A [[Type]] that can write each element in the tuple
     * @param length The number of elements in the tuple.
     */
    constructor({ type, length }) {
        super();
        assert.instanceOf(type, abstract_1.default);
        assert.nonNegativeInteger(length);
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
            buffer.addAll(flexInt.makeValueBuffer(this.length));
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
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
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert.instanceOf(value, Array);
        if (value.length !== this.length)
            throw new Error(`Length does not match: expected ${this.length} but got ${value.length}`);
        for (const instance of value)
            this.type.writeValue(buffer, instance);
    }
    consumeValue(buffer, offset, baseValue) {
        let length = 0;
        const value = baseValue ?? read_util_1.makeBaseValue(this);
        for (let i = 0; i < this.length; i++) {
            const element = this.type.consumeValue(buffer, offset + length);
            length += element.length;
            value[i] = element.value;
        }
        return { value, length };
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.type.equals(otherType.type)
            && this.length === otherType.length;
    }
}
exports.TupleType = TupleType;
