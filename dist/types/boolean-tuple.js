"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanTupleType = void 0;
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const write_util_1 = require("../lib/write-util");
const absolute_1 = require("./absolute");
/**
 * A type storing a fixed-length array of `Boolean` values.
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
    /**
     * @param length The number of `Boolean`s in each value of this type
     */
    constructor(length) {
        super();
        this.length = length;
        assert.nonNegativeInteger(length);
    }
    static get _value() {
        return 0x31;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            buffer.addAll(flexInt.makeValueBuffer(this.length));
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
        assert.isBuffer(buffer);
        assert.instanceOf(value, Array);
        if (value.length !== this.length)
            throw new Error(`Length does not match: expected ${this.length} but got ${value.length}`);
        write_util_1.writeBooleans(buffer, value);
    }
    consumeValue(bufferOffset) {
        return read_util_1.readBooleans({ bufferOffset, count: this.length });
    }
    equals(otherType) {
        return this.isSameType(otherType) && otherType.length === this.length;
    }
}
exports.BooleanTupleType = BooleanTupleType;
