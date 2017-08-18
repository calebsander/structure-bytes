"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const write_long_1 = require("../lib/write-long");
const integer_1 = require("./integer");
/**
 * A type storing an 8-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class LongType extends integer_1.default {
    static get _value() {
        return 0x04;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        write_long_1.default(buffer, value);
    }
}
exports.default = LongType;
