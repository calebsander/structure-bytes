"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const read_util_1 = require("../lib/read-util");
const strint = require("../lib/strint");
const unsigned_1 = require("./unsigned");
const UNSIGNED_LONG_MAX = '18446744073709551615';
/**
 * A type storing an 8-byte unsigned integer
 * (`0` to `18446744073709551615`).
 * Values to write must be given in base-10 string form.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedLongType
 * ````
 */
class UnsignedLongType extends unsigned_1.default {
    static get _value() {
        return 0x14;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, '1234567890123456789')
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert_1.default.instanceOf(value, String);
        assert_1.default(!(strint.gt(value, UNSIGNED_LONG_MAX) || strint.lt(value, '0')), 'Value out of range');
        const upper = strint.div(value, strint.LONG_UPPER_SHIFT); //get upper unsigned int
        const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)); //get lower unsigned int
        const byteBuffer = new ArrayBuffer(8);
        const dataView = new DataView(byteBuffer);
        dataView.setUint32(0, Number(upper));
        dataView.setUint32(4, Number(lower));
        buffer.addAll(byteBuffer);
    }
    consumeValue(buffer, offset) {
        const length = 8;
        assert_1.default(buffer.byteLength >= offset + length, read_util_1.NOT_LONG_ENOUGH);
        const dataView = new DataView(buffer, offset);
        const upper = dataView.getUint32(0);
        const lower = dataView.getUint32(4);
        return {
            value: strint.add(strint.mul(`${upper}`, strint.LONG_UPPER_SHIFT), `${lower}`),
            length
        };
    }
}
exports.default = UnsignedLongType;
