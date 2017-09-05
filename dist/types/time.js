"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const date = require("../lib/date");
const chrono_1 = require("./chrono");
/**
 * A type storing a specific time of day,
 * with millisecond precision.
 * The value is stored as a 4-byte unsigned integer.
 * Writes `Date` objects, but their year, month, and date
 * are ignored.
 *
 * When values are read, they are set to the arbitrary day of
 * `1970-01-01`.
 *
 * Example:
 * ````javascript
 * let type = new sb.TimeType
 * ````
 */
class TimeType extends chrono_1.default {
    static get _value() {
        return 0x1C;
    }
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Date(2017, 0, 1, 16, 37, 24, 189)) //16:37:24.189
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(value, Date);
        const byteBuffer = new ArrayBuffer(4);
        new DataView(byteBuffer).setUint32(0, value.getTime() % date.MILLIS_PER_DAY);
        buffer.addAll(byteBuffer);
    }
}
exports.default = TimeType;
