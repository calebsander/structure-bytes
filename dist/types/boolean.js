"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const growable_buffer_1 = require("../lib/growable-buffer");
const absolute_1 = require("./absolute");
/**
 * A type storing a `Boolean` value (1 bit)
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanType
 * ````
 */
class BooleanType extends absolute_1.default {
    static get _value() {
        return 0x30;
    }
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, true)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, Boolean);
        buffer.add(value ? 0xFF : 0x00); //all bits are set for good measure
    }
}
exports.default = BooleanType;
