"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingletonType = void 0;
const assert = require("../lib/assert");
const util_inspect_1 = require("../lib/util-inspect");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a fixed value.
 * The value takes up no space in the value bytes,
 * only the type bytes.
 * Functions as an [[EnumType]] with only one value.
 *
 * Example:
 * ````javascript
 * //Encodes a JSON literal value
 * let type = new sb.ChoiceType([
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'boolean'
 *     }),
 *     value: new sb.BooleanType
 *   }),
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'number'
 *     }),
 *     value: new sb.DoubleType
 *   }),
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'string'
 *     }),
 *     value: new sb.StringType
 *   })
 * ])
 * ````
 *
 * @param E The type of the value
 */
class SingletonType extends abstract_1.default {
    /**
     * @param type The type that can serialize this type's value
     * @param value The value to serialize
     * @throws If `value` cannot be serialized by `type`
     */
    constructor({ type, value }) {
        super();
        assert.instanceOf(type, absolute_1.default);
        this.type = type;
        this.value = value;
    }
    static get _value() {
        return 0x59;
    }
    get singletonValueBuffer() {
        if (!this.cachedValueBuffer) {
            this.cachedValueBuffer = this.type.valueBuffer(this.value);
        }
        return this.cachedValueBuffer;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
            buffer.addAll(this.singletonValueBuffer);
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
     * type.writeValue(buffer, {type: 'boolean', value: true})
     * type.writeValue(buffer, {type: 'string', value: 'abc'})
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert.isBuffer(buffer);
        if (!assert.equal.buffers(this.type.valueBuffer(value), this.singletonValueBuffer)) {
            throw new Error(`Expected ${util_inspect_1.inspect(this.value)} but got ${util_inspect_1.inspect(value)}`);
        }
    }
    consumeValue() {
        return { value: this.value, length: 0 };
    }
    equals(otherType) {
        return this.isSameType(otherType)
            && this.type.equals(otherType.type)
            && assert.equal.buffers(this.singletonValueBuffer, otherType.singletonValueBuffer);
    }
}
exports.SingletonType = SingletonType;
