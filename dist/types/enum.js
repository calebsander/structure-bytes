"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const growable_buffer_1 = require("../lib/growable-buffer");
const pointers_1 = require("../lib/pointers");
const util_inspect_1 = require("../lib/util-inspect");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 * @example
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
 * @extends Type
 * @inheritdoc
 */
class EnumType extends abstract_1.default {
    /**
     * @param {{type, value}} params
     * @param {Type} params.type The type of each element in the tuple
     * @param {type[]} params.values The possible distinct values.
     * Cannot contain more than 255 values.
     * @throws {Error} If any value is invalid for {@link type}
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
            assert_1.default.fail(String(values.length) + ' values is too many');
        }
        const valueIndices = new Map();
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const valueString = bufferString.toBinaryString(type.valueBuffer(value)); //convert value to bytes and then string for use as a map key
            if (valueIndices.has(valueString))
                assert_1.default.fail('Value is repeated: ' + util_inspect_1.inspect(value));
            valueIndices.set(valueString, i); //so writing a value has constant-time lookup into the values array
        }
        this.type = type;
        this.values = values; //used when reading to get constant-time lookup of value index into value
        this.valueIndices = valueIndices;
    }
    static get _value() {
        return 0x55;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
            buffer.add(this.valueIndices.size);
            for (const valueBuffer of this.valueIndices.keys()) {
                buffer.addAll(bufferString.fromBinaryString(valueBuffer));
            }
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {type} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, CHEETAH)
     */
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        const valueBuffer = new growable_buffer_1.default;
        this.type.writeValue(valueBuffer, value, false);
        const index = this.valueIndices.get(bufferString.toBinaryString(valueBuffer.toBuffer()));
        if (index === undefined)
            throw new Error('Not a valid enum value: ' + util_inspect_1.inspect(value));
        buffer.add(index); //write the index to the requested value in the values array
        pointers_1.setPointers({ buffer, root });
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
