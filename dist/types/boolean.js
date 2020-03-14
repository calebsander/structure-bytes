"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const write_util_1 = require("../lib/write-util");
const absolute_1 = require("./absolute");
/**
 * A type storing a `Boolean` value (1 bit)
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanType
 * ````
 */
class BooleanType extends absolute_1.default {
    static get _value() {
        return 0x30;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, true)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert.instanceOf(value, Boolean);
        write_util_1.writeBooleanByte(buffer, value);
    }
    consumeValue(buffer, offset) {
        return read_util_1.readBooleanByte(buffer, offset);
    }
}
exports.BooleanType = BooleanType;
