"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const read_util_1 = require("../lib/read-util");
const util_inspect_1 = require("../lib/util-inspect");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 *
 * Example:
 * ````javascript
 * //Storing different species' characteristics
 * const HUMAN = {heightFt: 6, speedMph: 28}
 * const CHEETAH = {heightFt: 3, speedMph: 70}
 * let type = new sb.EnumType({
 *   type: new sb.StructType({
 *     heightFt: new sb.FloatType,
 *     speedMph: new sb.UnsignedByteType
 *   }),
 *   values: [HUMAN, CHEETAH]
 * })
 * ````
 *
 * @param E The type of each value in the enum
 */
class EnumType extends abstract_1.default {
    /**
     * @param type The type of each element in the tuple
     * @param values The possible distinct values.
     * Cannot contain more than 255 values.
     * @throws If any value cannot be serialized by `type`
     */
    constructor({ type, values }) {
        super();
        assert_1.default.instanceOf(type, absolute_1.default); //pointer types don't make sense because each value should be distinct
        assert_1.default.instanceOf(values, Array);
        //At most 255 values allowed
        try {
            assert_1.default.byteUnsignedInteger(values.length);
        }
        catch (e) {
            assert_1.default.fail(`${values.length} values is too many`);
        }
        this.type = type;
        this.values = values; //used when reading to get constant-time lookup of value index into value
    }
    static get _value() {
        return 0x55;
    }
    get valueIndices() {
        const { type, values, cachedValueIndices } = this;
        if (cachedValueIndices)
            return cachedValueIndices;
        const valueIndices = new Map();
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const valueString = bufferString.toBinaryString(type.valueBuffer(value)); //convert value to bytes and then string for use as a map key
            if (valueIndices.has(valueString))
                assert_1.default.fail('Value is repeated: ' + util_inspect_1.inspect(value));
            valueIndices.set(valueString, i); //so writing a value has constant-time lookup into the values array
        }
        return this.cachedValueIndices = valueIndices;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
            buffer.add(this.values.length);
            for (const valueBuffer of this.valueIndices.keys()) {
                buffer.addAll(bufferString.fromBinaryString(valueBuffer));
            }
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
     * type.writeValue(buffer, CHEETAH)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        const valueBuffer = this.type.valueBuffer(value);
        const index = this.valueIndices.get(bufferString.toBinaryString(valueBuffer));
        if (index === undefined)
            throw new Error('Not a valid enum value: ' + util_inspect_1.inspect(value));
        buffer.add(index); //write the index to the requested value in the values array
    }
    consumeValue(buffer, offset) {
        assert_1.default(buffer.byteLength > offset, read_util_1.NOT_LONG_ENOUGH);
        const valueIndex = new Uint8Array(buffer)[offset];
        const value = this.values[valueIndex];
        if (value === undefined)
            throw new Error(`Index ${valueIndex} is invalid`);
        return { value, length: 1 };
    }
    equals(otherType) {
        if (!super.equals(otherType))
            return false;
        const otherEnumType = otherType;
        if (!this.type.equals(otherEnumType.type))
            return false;
        if (this.values.length !== otherEnumType.values.length)
            return false;
        const otherValuesIterator = otherEnumType.valueIndices.keys();
        for (const thisValue of this.valueIndices.keys()) {
            const otherValue = otherValuesIterator.next().value;
            if (otherValue !== thisValue)
                return false;
        }
        return true;
    }
}
exports.default = EnumType;
