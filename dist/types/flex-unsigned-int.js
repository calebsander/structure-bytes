"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const str_to_num_1 = require("../lib/str-to-num");
const unsigned_1 = require("./unsigned");
/**
 * A type storing any unsigned integer
 * that can be represented precisely in a double
 * (from `0` to `9007199254740991` (`2 ** 53 - 1`)).
 * Rather than having a fixed-length value representation,
 * more bytes are needed to represent larger values.
 * This is inspired by the UTF-8 format:
 * large values can be stored, but since most values
 * are small, fewer bytes are used in the typical case.
 * If values are uniformly distributed rather than
 * concentrated among smaller values, you will likely get
 * more efficient serializations from a fixed-width integer.
 * For example, when writing outputs of a 32-bit hash function,
 * you should use [[UnsignedIntType]] instead.
 *
 * The number of bytes required for numbers are as follows:
 * <table>
 *   <thead>
 *     <tr>
 *       <th>Min</th>
 *       <th>Max</th>
 *       <th>Bytes</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr><td>0</td><td>127</td><td>1</td></tr>
 *     <tr><td>128</td><td>16511</td><td>2</td></tr>
 *     <tr><td>16512</td><td>2113663</td><td>3</td></tr>
 *     <tr><td>2113664</td><td>270549119</td><td>4</td></tr>
 *     <tr><td>270549120</td><td>34630287487</td><td>5</td></tr>
 *     <tr><td>34630287488</td><td>4432676798591</td><td>6</td></tr>
 *     <tr><td>4432676798592</td><td>567382630219903</td><td>7</td></tr>
 *     <tr><td>567382630219904</td><td>9007199254740991</td><td>8</td></tr>
 *   </tbody>
 * </table>
 *
 * Example:
 * ````javascript
 * let type = new sb.FlexUnsignedIntType
 * ````
 */
class FlexUnsignedIntType extends unsigned_1.default {
    static get _value() {
        return 0x17;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * //Takes 4 bytes
     * type.writeValue(buffer, 2113664) //or '2113664'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        const convertedValue = str_to_num_1.default(value);
        if (convertedValue !== undefined)
            value = convertedValue;
        assert.integer(value);
        buffer.addAll(flexInt.makeValueBuffer(value));
    }
    consumeValue(buffer, offset) {
        return read_util_1.readFlexInt(buffer, offset);
    }
}
exports.FlexUnsignedIntType = FlexUnsignedIntType;
