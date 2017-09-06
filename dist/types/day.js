"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const date = require("../lib/date");
const chrono_1 = require("./chrono");
/**
 * A type storing a specific day in time.
 * The value is stored as a 3-byte signed integer.
 *
 * Example:
 * ````javascript
 * let type = new sb.DayType
 * ````
 */
class DayType extends chrono_1.default {
    static get _value() {
        return 0x1B;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type.
     * Writes `Date` objects but ignores all units smaller than the day.
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Date(2001, 0, 1)) //Jan 1st, 2001
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
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
