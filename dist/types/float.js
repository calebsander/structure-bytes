"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const str_to_num_1 = require("../lib/str-to-num");
const floating_1 = require("./floating");
/**
 * A type storing a 4-byte [IEEE floating point](https://en.wikipedia.org/wiki/IEEE_floating_point).
 * Can also represent `NaN`, `Infinity`, and `-Infinity`.
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.FloatType
 * ````
 */
class FloatType extends floating_1.default {
    static get _value() {
        return 0x20;
    }
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, 1.23) //or '1.23'
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, NaN) //or 'NaN'
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, Infinity) //or 'Infinity'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        const convertedValue = str_to_num_1.default(value);
        if (convertedValue !== undefined)
            value = convertedValue;
        assert_1.default.instanceOf(value, Number);
        const byteBuffer = new ArrayBuffer(4);
        new DataView(byteBuffer).setFloat32(0, value);
        buffer.addAll(byteBuffer);
    }
}
exports.default = FloatType;
