"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const bit_math_1 = require("./bit-math");
//Writes an array of booleans for BooleanTupleType or BooleanArrayType
//The boolean at index 8a + b is in the bth MSB (0-indexed) of the ath byte
exports.default = (buffer, booleans) => {
    assert_1.default.instanceOf(booleans, Array);
    const incompleteBytes = bit_math_1.modEight(booleans.length); //whether the booleans take up a partial byte
    const bytes = bit_math_1.dividedByEight(booleans.length); //floored, so need to add one if incompleteBytes
    let length;
    if (incompleteBytes)
        length = bytes + 1;
    else
        length = bytes;
    const byteBuffer = new ArrayBuffer(length);
    const castBuffer = new Uint8Array(byteBuffer);
    for (let i = 0; i < booleans.length; i++) {
        const boolean = booleans[i];
        assert_1.default.instanceOf(boolean, Boolean);
        const bit = bit_math_1.modEight(~bit_math_1.modEight(i)); //7 - (i % 8)
        //Set desired bit, leaving the others unchanges
        if (boolean)
            castBuffer[bit_math_1.dividedByEight(i)] |= 1 << bit;
        else
            castBuffer[bit_math_1.dividedByEight(i)] &= ~(1 << bit);
    }
    buffer.addAll(byteBuffer);
};
