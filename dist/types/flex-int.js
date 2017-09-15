"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const str_to_num_1 = require("../lib/str-to-num");
const integer_1 = require("./integer");
/**
 * Converts a signed integer value
 * to a unique unsigned integer value
 * @param signed The signed integer value
 */
function toUnsigned(signed) {
    if (signed < 0)
        return -2 * signed - 1;
    return 2 * signed;
}
/**
 * Converts an unsigned integer value
 * to a unique signed integer value.
 * The inverse of [[toUnsigned]].
 * @param signed The unsigned integer value
 */
function fromUnsigned(unsigned) {
    if (unsigned & 1)
        return (unsigned + 1) / -2;
    return unsigned / 2;
}
exports.fromUnsigned = fromUnsigned;
const MIN_SAFE = fromUnsigned(Number.MAX_SAFE_INTEGER); //< 0; inclusive
const MAX_SAFE = fromUnsigned(Number.MAX_SAFE_INTEGER - 1) + 1; //> 0; exclusive
/**
 * Works like [[FlexUnsignedIntType]],
 * but allows for negative values as well.
 * Less efficient for storing positive values
 * than [[FlexUnsignedIntType]], so use that
 * instead if not storing negative values.
 * Also limited to values between
 * `-(2 ** 52)` and `2 ** 52 - 1`.
 * (Encodes `value` as approximately `2 * abs(value)`.)
 *
 * Example:
 * ````javascript
 * let type = new sb.FlexIntType
 * ````
 */
class FlexIntType extends integer_1.default {
    static get _value() {
        return 0x07;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * //Takes 4 bytes
     * type.writeValue(buffer, -2113664) //or '-2113664'
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
        assert_1.default.integer(value);
        assert_1.default.between(MIN_SAFE, value, MAX_SAFE);
        buffer.addAll(flexInt.makeValueBuffer(toUnsigned(value)));
    }
}
exports.default = FlexIntType;
