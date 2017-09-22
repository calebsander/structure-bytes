"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const util_inspect_1 = require("../lib/util-inspect");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a value of one of several fixed types.
 * The list of possible types must contain at most 255 types.
 *
 * Example:
 * ````javascript
 * let hexType = new sb.StructType({
 *   hex: new sb.StringType
 * })
 * let rgbType = new sb.StructType({
 *   r: new sb.FloatType,
 *   g: new sb.FloatType,
 *   b: new sb.FloatType
 * })
 * let hueType = new sb.FloatType
 * let type = new sb.ChoiceType([
 *   hexType,
 *   rgbType,
 *   hueType
 * ])
 * ````
 *
 * @param E The type of value this choice type can write.
 * If you provide, e.g. a `Type<A>` and a `Type<B>` and a `Type<C>`
 * to the constructor, `E` should be `A | B | C`.
 * In TypeScript, you have to declare this manually
 * unless all the value types are identical.
 * @param READ_E The type of values this type will read
 */
class ChoiceType extends absolute_1.default {
    /**
     * @param types The list of possible types.
     * Cannot contain more than 255 types.
     * Values will be written using the first type in the list
     * that successfully writes the value,
     * so place higher priority types earlier.
     */
    constructor(types) {
        super();
        assert_1.default.instanceOf(types, Array);
        try {
            assert_1.default.byteUnsignedInteger(types.length);
        }
        catch (e) {
            assert_1.default.fail(String(types.length) + ' types is too many');
        }
        for (const type of types)
            assert_1.default.instanceOf(type, abstract_1.default);
        this.types = types;
    }
    static get _value() {
        return 0x56;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            buffer.add(this.types.length);
            for (const type of this.types)
                type.addToBuffer(buffer);
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
     * type.writeValue(buffer, {hex: '#abcdef'}) //writes using hexType
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, {r: 1, g: 0, b: 0.5}) //writes using rgbType
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, 180) //writes using hueType
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        let success = false;
        //Try to write value using each type in order until no error is thrown
        for (let i = 0; i < this.types.length; i++) {
            const type = this.types[i];
            let valueBuffer;
            try {
                valueBuffer = type.valueBuffer(value);
            }
            catch (e) {
                continue;
            }
            buffer
                .add(i)
                .addAll(valueBuffer);
            success = true;
            break;
        }
        if (!success)
            assert_1.default.fail('No types matched: ' + util_inspect_1.inspect(value));
    }
    consumeValue(buffer, offset) {
        let length = 1;
        assert_1.default(buffer.byteLength > offset, read_util_1.NOT_LONG_ENOUGH);
        const typeIndex = new Uint8Array(buffer)[offset];
        const { value, length: subLength } = this.types[typeIndex].consumeValue(buffer, offset + length);
        length += subLength;
        return { value, length };
    }
    equals(otherType) {
        if (!super.equals(otherType))
            return false;
        const otherChoiceType = otherType;
        if (this.types.length !== otherChoiceType.types.length)
            return false;
        for (let i = 0; i < this.types.length; i++) {
            if (!this.types[i].equals(otherChoiceType.types[i]))
                return false;
        }
        return true;
    }
}
exports.default = ChoiceType;
