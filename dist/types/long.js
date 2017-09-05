"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const write_long_1 = require("../lib/write-long");
const integer_1 = require("./integer");
/**
 * A type storing an 8-byte signed integer
 * (`-9223372036854775808` to `9223372036854775807`).
 * Values to write must be given in base-10 string form.
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
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, '-1234567890123456789')
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        write_long_1.default(buffer, value);
    }
}
exports.default = LongType;
