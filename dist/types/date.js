"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const write_long_1 = require("../lib/write-long");
const chrono_1 = require("./chrono");
/**
 * A type storing a `Date` with millisecond precision.
 * The value is stored as an 8-byte signed integer.
 *
 * Example:
 * ````javascript
 * let type = new sb.DateType
 * ````
 */
class DateType extends chrono_1.default {
    static get _value() {
        return 0x1A;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Date)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert_1.default.instanceOf(value, Date);
        write_long_1.default(buffer, String(value.getTime()));
    }
    consumeValue(buffer, offset) {
        const { value, length } = read_util_1.readLong(buffer, offset);
        return {
            value: new Date(Number(value)),
            length
        };
    }
}
exports.default = DateType;
