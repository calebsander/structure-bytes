"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const util_inspect_1 = require("../lib/util-inspect");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
const pointer = require("./pointer");
const recursive = require("./recursive");
/**
 * A type storing a value of one of several fixed types.
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
     * Values will be written using the first type in the list
     * that successfully writes the value,
     * so place higher priority types earlier.
     */
    constructor(types) {
        super();
        this.types = types;
        assert.instanceOf(types, Array);
        for (const type of types)
            assert.instanceOf(type, abstract_1.default);
    }
    static get _value() {
        return 0x56;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            buffer.addAll(flexInt.makeValueBuffer(this.types.length));
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
        buffer.pause();
        let success = false;
        //Try to write value using each type in order until no error is thrown
        for (let i = 0; i < this.types.length; i++) {
            const type = this.types[i];
            buffer.addAll(flexInt.makeValueBuffer(i));
            try {
                type.writeValue(buffer, value);
                success = true;
                break;
            }
            catch {
                buffer.reset();
                pointer.rewindBuffer(buffer);
                recursive.rewindBuffer(buffer);
            }
        }
        buffer.resume();
        if (!success)
            throw new Error('No types matched: ' + util_inspect_1.inspect(value));
    }
    consumeValue(buffer, offset) {
        //tslint:disable-next-line:prefer-const
        let { value: typeIndex, length } = read_util_1.readFlexInt(buffer, offset);
        const { value, length: subLength } = this.types[typeIndex].consumeValue(buffer, offset + length);
        length += subLength;
        return { value, length };
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.types.length === otherType.types.length
            && this.types.every((type, i) => type.equals(otherType.types[i]));
    }
}
exports.ChoiceType = ChoiceType;
