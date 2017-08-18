"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
/**
 * A type storing a value of another type or {@link null} or {@link undefined}.
 * {@link null} and {@link undefined} are treated identically,
 * and reading either value will result in {@link null}.
 * @example
 * //If you have a job slot that may or may not be filled
 * let personType = new sb.StructType({...})
 * let type = new sb.StructType({
 *   title: new sb.StringType,
 *   employee: new sb.OptionalType(personType)
 * })
 * @extends Type
 * @inheritdoc
 */
class OptionalType extends absolute_1.default {
    /**
     * @param {Type} type The type of any non-{@link null} value
     */
    constructor(type) {
        super();
        assert_1.default.instanceOf(type, abstract_1.default);
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
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {null|undefined|type} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, {
     *   title: 'Manager',
     *   employee: person1
     * })
     * type.writeValue(buffer, {
     *   title: 'Assistant Librarian',
     *   employee: null
     * })
     * type.writeValue(buffer, {
     *   title: 'Assistant Librarian'
     * })
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        if (value === null || value === undefined)
            buffer.add(0x00);
        else {
            buffer.add(0xFF);
            this.type.writeValue(buffer, value);
        }
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.type.equals(otherType.type);
    }
}
exports.default = OptionalType;
