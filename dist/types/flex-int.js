"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlexIntType = void 0;
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const str_to_num_1 = require("../lib/str-to-num");
const integer_1 = require("./integer");
/**
 * Converts a signed integer value
 * to a unique unsigned integer value
 * @param signed The signed integer value
 */
const toUnsigned = (signed) => signed < 0
    ? -2 * signed - 1
    : 2 * signed;
/**
 * Converts an unsigned integer value
 * to a unique signed integer value.
 * The inverse of [[toUnsigned]].
 * @param signed The unsigned integer value
 */
const fromUnsigned = (unsigned) => unsigned & 1
    ? (unsigned + 1) / -2
    : unsigned / 2;
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
        assert.isBuffer(buffer);
        const convertedValue = str_to_num_1.default(value);
        if (convertedValue !== undefined)
            value = convertedValue;
        assert.integer(value);
        assert.between(MIN_SAFE, value, MAX_SAFE);
        buffer.addAll(flexInt.makeValueBuffer(toUnsigned(value)));
    }
    consumeValue(bufferOffset) {
        const value = read_util_1.readFlexInt(bufferOffset);
        return fromUnsigned(value);
    }
}
exports.FlexIntType = FlexIntType;
