"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const growable_buffer_1 = require("../lib/growable-buffer");
const pointers_1 = require("../lib/pointers");
const util_inspect_1 = require("../lib/util-inspect");
const absolute_1 = require("./absolute");
const struct_1 = require("./struct");
/**
 * A type storing a value of one of several fixed classes.
 * Each class is associated with a {@link StructType}
 * used to write values of instances of the class.
 * Unlike {@link ChoiceType}, read values specify the type
 * used to write them.
 * The list of possible types must contain at most 255 types.
 * {@link NamedChoiceType} is similar to {@link ChoiceType} in most respects.
 * @example
 * //Storing various barcode types
 * class QRCode {
 *   constructor(text) {
 *     this.text = text
 *   }
 * }
 * class UPC {
 *   constructor(number) {
 *     this.number = number
 *   }
 * }
 * let barcodeType = new sb.NamedChoiceType(new Map()
 *   .set(QRCode, new sb.StructType({
 *     text: new sb.StringType
 *   }))
 *   .set(UPC, new sb.StructType({
 *     number: new sb.UnsignedLongType
 *   }))
 * )
 * @extends Type
 * @inheritdoc
 */
class NamedChoiceType extends absolute_1.default {
    /**
     * @param {Map.<constructor, StructType>} types The mapping
     * of constructors to associated types.
     * Cannot contain more than 255 types.
     * Values will be written using the type
     * associated with the first constructor in the map
     * of which they are an instance,
     * so place higher priority types earlier.
     * For example, if you wanted to be able to write
     * the values of instances of a subclass and a superclass,
     * put the subclass first so that all its fields
     * are written, not just those inherited from the superclass.
     */
    constructor(constructorTypes) {
        super();
        assert_1.default.instanceOf(constructorTypes, Map);
        try {
            assert_1.default.byteUnsignedInteger(constructorTypes.size);
        }
        catch (e) {
            assert_1.default.fail(String(constructorTypes.size) + ' types is too many');
        }
        this.indexConstructors = new Map;
        this.constructorTypes = new Array(constructorTypes.size);
        const usedNames = new Set();
        for (const [constructor, type] of constructorTypes) {
            assert_1.default.instanceOf(constructor, Function);
            const { name } = constructor;
            assert_1.default(name !== '', 'Function does not have a name');
            assert_1.default(!usedNames.has(name), 'Function name "' + name + '" is repeated');
            usedNames.add(name);
            //Name must fit in 255 UTF-8 bytes
            const typeNameBuffer = bufferString.fromString(name);
            try {
                assert_1.default.byteUnsignedInteger(typeNameBuffer.byteLength);
            }
            catch (e) {
                assert_1.default.fail('Function name "' + name + '" is too long');
            }
            assert_1.default.instanceOf(type, struct_1.default);
            const constructorIndex = this.indexConstructors.size;
            this.indexConstructors.set(constructorIndex, constructor);
            this.constructorTypes[constructorIndex] = { nameBuffer: typeNameBuffer, type };
        }
    }
    static get _value() {
        return 0x58;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            buffer.add(this.constructorTypes.length);
            for (const { nameBuffer, type } of this.constructorTypes) {
                buffer.add(nameBuffer.byteLength);
                buffer.addAll(nameBuffer);
                type.addToBuffer(buffer);
            }
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type.
     * The constructor name will be transfered to the read value.
     * So, if you write using the type associated with {@link QRCode},
     * the read value's constructor will also be named {@link "QRCode"}.
     * If, however, you write an instance of a subclass of {@link QRCode},
     * it will write as {@link QRCode} and the read value's constructor
     * will be named {@link "QRCode"}.
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, new QRCode('abc')) //writes as QRCode
     * type.writeValue(buffer, new UPC('0123')) //writes as UPC
     */
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, Object);
        let writeIndex;
        for (const [index, constructor] of this.indexConstructors) {
            if (value instanceof constructor) {
                writeIndex = index;
                break;
            }
        }
        if (writeIndex === undefined)
            throw new Error('No types matched: ' + util_inspect_1.inspect(value));
        buffer.add(writeIndex);
        const { type } = this.constructorTypes[writeIndex];
        type.writeValue(buffer, value, false);
        pointers_1.setPointers({ buffer, root });
    }
    equals(otherType) {
        if (!super.equals(otherType))
            return false;
        const otherChoiceType = otherType;
        if (this.constructorTypes.length !== otherChoiceType.constructorTypes.length)
            return false;
        for (let i = 0; i < this.constructorTypes.length; i++) {
            const thisConstructor = this.constructorTypes[i];
            const otherConstructor = otherChoiceType.constructorTypes[i];
            if (!thisConstructor.type.equals(otherConstructor.type))
                return false;
            try {
                assert_1.default.equal(otherConstructor.nameBuffer, thisConstructor.nameBuffer);
            }
            catch (e) {
                return false;
            }
        }
        return true;
    }
}
exports.default = NamedChoiceType;
