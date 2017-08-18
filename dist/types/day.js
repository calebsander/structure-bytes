"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const date = require("../lib/date");
const chrono_1 = require("./chrono");
/**
 * A type storing a specific day in history.
 * The value is stored as a 3-byte signed integer.
 * @extends Type
 * @inheritdoc
 */
class DayType extends chrono_1.default {
    static get _value() {
        return 0x1B;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {external:Date} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(value, Date);
        //Instead of taking value.getTime() / MILLIS_PER_DAY (which would act as if the date was measured at UTC),
        //we round down the date in the current time zone
        const flooredDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const day = date.toUTC(flooredDate) / date.MILLIS_PER_DAY;
        const byteBuffer = new ArrayBuffer(3);
        const dataView = new DataView(byteBuffer);
        dataView.setInt16(0, day >> 8);
        dataView.setUint8(2, day /*& 0xFF*/); //DataView will only use last 8 bits anyways
        buffer.addAll(byteBuffer);
    }
}
exports.default = DayType;
