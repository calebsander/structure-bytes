"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const flexInt = require("../lib/flex-int");
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
     * @param type The type of each value of the enum
     * @param values The possible distinct values.
     * @throws If any value cannot be serialized by `type`
     */
    constructor({ type, values }) {
        super();
        assert.instanceOf(type, absolute_1.default); //pointer types don't make sense because each value should be distinct
        assert.instanceOf(values, Array);
        this.type = type;
        this.values = values; //used when reading to get constant-time lookup of value index into value
    }
    static get _value() {
        return 0x55;
    }
    get valueIndices() {
        if (!this.cachedValueIndices) {
            const { type, values } = this;
            const valueIndices = new Map();
            values.forEach((value, i) => {
                //Convert value to bytes and then string for use as a map key
                const valueString = bufferString.toBinaryString(type.valueBuffer(value));
                if (valueIndices.has(valueString))
                    throw new Error('Value is repeated: ' + util_inspect_1.inspect(value));
                valueIndices.set(valueString, i); //so writing a value has constant-time lookup into the values array
            });
            this.cachedValueIndices = valueIndices;
        }
        return this.cachedValueIndices;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
            buffer.addAll(flexInt.makeValueBuffer(this.values.length));
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
        //Write the index to the requested value in the values array
        buffer.addAll(flexInt.makeValueBuffer(index));
    }
    consumeValue(buffer, offset) {
        const { value: valueIndex, length } = read_util_1.readFlexInt(buffer, offset);
        const value = this.values[valueIndex];
        if (value === undefined)
            throw new Error(`Index ${valueIndex} is invalid`);
        return { value, length };
    }
    equals(otherType) {
        if (!super.equals(otherType))
            return false;
        if (!this.type.equals(otherType.type))
            return false;
        if (this.values.length !== otherType.values.length)
            return false;
        const otherIndices = otherType.valueIndices;
        for (const [thisValue, thisIndex] of this.valueIndices) {
            if (otherIndices.get(thisValue) !== thisIndex)
                return false;
        }
        return true;
    }
}
exports.EnumType = EnumType;
