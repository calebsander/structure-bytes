"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const write_iterable_1 = require("../lib/write-iterable");
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
 */
class SetType extends absolute_1.default {
    /**
     * @param type A [[Type]] that can serialize each element in the set
     */
    constructor(type) {
        super();
        assert_1.default.instanceOf(type, abstract_1.default);
        this.type = type;
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
     * Appends value bytes to a [[GrowableBuffer]] according to the type
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
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(value, Set);
        write_iterable_1.default({ type: this.type, buffer, value, length: value.size, root });
    }
    equals(otherType) {
        return super.equals(otherType) && this.type.equals(otherType.type);
    }
}
exports.default = SetType;
