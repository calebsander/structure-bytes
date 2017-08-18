"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const date = require("../lib/date");
const chrono_1 = require("./chrono");
/**
 * A type storing a specific time of day.
 * The value is stored as a 4-byte unsigned integer.
 * @extends Type
 * @inheritdoc
 */
class TimeType extends chrono_1.default {
    static get _value() {
        return 0x1C;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {external:Date} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(value, Date);
        const byteBuffer = new ArrayBuffer(4);
        new DataView(byteBuffer).setUint32(0, value.getTime() % date.MILLIS_PER_DAY);
        buffer.addAll(byteBuffer);
    }
}
exports.default = TimeType;
