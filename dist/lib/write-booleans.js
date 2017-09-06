"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const bit_math_1 = require("./bit-math");
/**
 * Writes an array of booleans for [[BooleanTupleType]]
 * or [[BooleanArrayType]].
 * The boolean at index `8 * a + b` (where `a` is an integer
 * and `b` is an integer from `0` to `7`) is in the `b`th MSB
 * (0-indexed) of the `a`th appended byte.
 * @param buffer The buffer to which to append the bytes
 * @param booleans The boolean values to write
 */
exports.default = (buffer, booleans) => {
    assert_1.default.instanceOf(booleans, Array);
    byteLoop: for (let byteIndex = 0;; byteIndex++) {
        let byteValue = 0;
        for (let bit = 0; bit < 8; bit++) {
            const booleanIndex = bit_math_1.timesEight(byteIndex) | bit;
            if (booleanIndex === booleans.length) {
                if (bit)
                    buffer.add(byteValue);
                break byteLoop;
            }
            const bool = booleans[booleanIndex];
            assert_1.default.instanceOf(bool, Boolean);
            if (bool)
                byteValue |= 1 << (7 - bit); //go from most significant bit to least significant
        }
        buffer.add(byteValue);
    }
};
