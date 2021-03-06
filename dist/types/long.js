"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongType = void 0;
const assert = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const write_util_1 = require("../lib/write-util");
const integer_1 = require("./integer");
/**
 * A type storing an 8-byte signed integer
 * (`-9223372036854775808` to `9223372036854775807`).
 * Each value must be provided as a BigInt.
 *
 * Example:
 * ````javascript
 * let type = new sb.LongType
 * ````
 */
class LongType extends integer_1.default {
    static get _value() {
        return 0x04;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, -1234567890123456789n)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert.isBuffer(buffer);
        write_util_1.writeLong(buffer, value);
    }
    consumeValue(bufferOffset) {
        return read_util_1.readLong(bufferOffset);
    }
}
exports.LongType = LongType;
