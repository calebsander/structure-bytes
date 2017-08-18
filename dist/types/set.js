"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const write_iterable_1 = require("../lib/write-iterable");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a variable-size set of values of the same type
 * Works much like {@link ArrayType} except all values are {@link Set}s.
 * @example
 * //For storing some number of people
 * let personType = new sb.StructType({...})
 * let type = new sb.SetType(personType)
 * @extends ArrayType
 * @inheritdoc
 */
class SetType extends absolute_1.default {
    /**
     * @param {Type} type The type of each element in the set
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
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Set.<type>} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, new Set().add(person1).add(person2).add(person3))
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
