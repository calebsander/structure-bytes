"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a value of another type or `null` or `undefined`.
 * `null` and `undefined` are treated identically,
 * and reading either value will result in `null`.
 *
 * Example:
 * ````javascript
 * //If you have a job slot that may or may not be filled
 * let personType = new sb.StructType({
 *   age: new sb.UnsignedByteType,
 *   name: new sb.StringType
 * })
 * let type = new sb.StructType({
 *   title: new sb.StringType,
 *   employee: new sb.OptionalType(personType)
 * })
 * ````
 *
 * @param E The type of non-`null` values
 * @param READ_E The type of non-`null` read values
 */
class OptionalType extends absolute_1.default {
    /**
     * @param type The [[Type]] used to write values
     * if they are not `null` or `undefined`
     */
    constructor(type) {
        super();
        assert.instanceOf(type, abstract_1.default);
        this.type = type;
    }
    static get _value() {
        return 0x60;
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
     * Examples:
     * ````javascript
     * type.writeValue(buffer, {
     *   title: 'Manager',
     *   employee: null //or undefined
     * })
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, {
     *   title: 'Coder',
     *   employee: {age: 19, name: 'Johnny'}
     * })
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        switch (value) {
            case null:
            case undefined:
                buffer.add(0x00);
                break;
            default:
                buffer.add(0xFF);
                this.type.writeValue(buffer, value);
        }
    }
    consumeValue(buffer, offset) {
        const nonNull = read_util_1.readBooleanByte(buffer, offset);
        let { length } = nonNull;
        let value;
        if (nonNull.value) {
            const subValue = this.type.consumeValue(buffer, offset + length);
            ({ value } = subValue);
            length += subValue.length;
        }
        else
            value = null;
        return { value, length };
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.type.equals(otherType.type);
    }
}
exports.OptionalType = OptionalType;
