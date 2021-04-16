"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetType = void 0;
const assert = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const write_util_1 = require("../lib/write-util");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a variable-size set of values of the same type.
 * Works much like [[ArrayType]] except all values are `Set`s.
 *
 * Example:
 * ````javascript
 * //For storing some number of people
 * let personType = new sb.StructType({
 *   dob: new sb.DayType,
 *   name: new sb.StringType
 * })
 * let type = new sb.SetType(personType)
 * ````
 *
 * @param E The type of each element in the set
 * @param READ_E The type of each element
 * in the read set
 */
class SetType extends absolute_1.default {
    /**
     * @param type A [[Type]] that can serialize each element in the set
     */
    constructor(type) {
        super();
        this.type = type;
        assert.instanceOf(type, abstract_1.default);
    }
    static get _value() {
        return 0x53;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
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
     * let person1 = {dob: new Date(1980, 3, 10), name: 'Alfred'}
     * let person2 = {dob: new Date(1970, 4, 9), name: 'Betty'}
     * let person3 = {dob: new Date(1990, 5, 8), name: 'Cramer'}
     * type.writeValue(buffer, new Set([person1, person2, person3]))
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert.isBuffer(buffer);
        assert.instanceOf(value, Set);
        write_util_1.writeIterable({ type: this.type, buffer, value, length: value.size });
    }
    consumeValue(buffer, offset, baseValue) {
        const readSize = read_util_1.readFlexInt(buffer, offset);
        const size = readSize.value;
        let { length } = readSize;
        const value = baseValue || read_util_1.makeBaseValue(this);
        for (let i = 0; i < size; i++) {
            const element = this.type.consumeValue(buffer, offset + length);
            length += element.length;
            value.add(element.value);
        }
        return { value, length };
    }
    equals(otherType) {
        return this.isSameType(otherType) && this.type.equals(otherType.type);
    }
}
exports.SetType = SetType;
