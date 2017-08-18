"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const pointers_1 = require("../lib/pointers");
const util_inspect_1 = require("../lib/util-inspect");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a value of one of several fixed types.
 * The list of possible types must contain at most 255 types.
 * @example
 * //If you have a lot of numbers that fit in an unsigned byte
 * //but could conceivably have one that requires a long
 * let type = new sb.ChoiceType([
 *   new sb.UnsignedByteType,
 *   new sb.UnsignedLongType
 * ])
 * @extends Type
 * @inheritdoc
 */
class ChoiceType extends absolute_1.default {
    /**
     * @param {Type[]} types The list of possible types.
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
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, 10) //writes as an unsigned byte
     * type.writeValue(buffer, 1000) //writes as an unsigned long
     */
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        let success = false;
        //Try to write value using each type in order until no error is thrown
        for (let i = 0; i < this.types.length; i++) {
            const type = this.types[i];
            const valueBuffer = new growable_buffer_1.default;
            try {
                type.writeValue(valueBuffer, value, false);
            }
            catch (e) {
                continue;
            }
            buffer.add(i);
            buffer.addAll(valueBuffer.toBuffer());
            success = true;
            break;
        }
        if (!success)
            assert_1.default.fail('No types matched: ' + util_inspect_1.inspect(value));
        pointers_1.setPointers({ buffer, root });
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
