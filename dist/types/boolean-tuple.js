"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const write_booleans_1 = require("../lib/write-booleans");
const absolute_1 = require("./absolute");
/**
 * A type storing a fixed-length array of `Boolean` values.
 * The length must be at most 255.
 * This type creates more efficient serializations than
 * `new sb.TupleType({type: new sb.BooleanType})` for boolean tuples,
 * since it works with bits instead of whole bytes.
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanTupleType(100)
 * ````
 */
class BooleanTupleType extends absolute_1.default {
    static get _value() {
        return 0x31;
    }
    /**
     * @param length The number of `Boolean`s in each value of this type. Must be between 0 and 255.
     */
    constructor(length) {
        super();
        assert_1.default.byteUnsignedInteger(length);
        this.length = length;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            buffer.add(this.length);
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
     * type.writeValue(buffer, new Array(100).fill(true)) //takes up 13 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert_1.default.instanceOf(value, Array);
        assert_1.default(value.length === this.length, 'Length does not match: expected ' + String(this.length) + ' but got ' + String(value.length));
        write_booleans_1.default(buffer, value);
    }
    consumeValue(buffer, offset) {
        return read_util_1.readBooleans({
            buffer,
            offset,
            count: this.length
        });
    }
    equals(otherType) {
        return super.equals(otherType) && otherType.length === this.length;
    }
}
exports.default = BooleanTupleType;
