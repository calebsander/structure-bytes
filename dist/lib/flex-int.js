"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
function possibleValueCount(bytes) {
    const usableBits = 7 * bytes;
    return Math.pow(2, usableBits); //can't bit-shift because this may not fit in 32-bit integer
}
const UPPER_BOUNDS = new Map(); //mapping of numbers of bytes to the exclusive upper bound on numbers in the range
{
    let cumulativeValues = 0;
    let bytes = 0;
    while (cumulativeValues <= Number.MAX_SAFE_INTEGER) {
        UPPER_BOUNDS.set(bytes, cumulativeValues);
        bytes++;
        cumulativeValues += possibleValueCount(bytes);
    }
    UPPER_BOUNDS.set(bytes, cumulativeValues);
}
//Mapping of the number of leading ones in the first byte's mask to the number of bytes
const NUMBER_OF_BYTES = new Map();
//Mapping of numbers of bytes to the mask for the first byte
//Goes 0b00000000, 0b10000000, 0b11000000, etc.
const BYTE_MASKS = new Map();
{
    let mask = 0;
    let bitToMaskNext = 7; //0 is least significant bit, 7 is most significant bit
    for (const bytes of UPPER_BOUNDS.keys()) {
        if (!bytes)
            continue; //should never be writing with 0 bytes
        BYTE_MASKS.set(bytes, mask);
        NUMBER_OF_BYTES.set(bytes - 1, bytes);
        mask |= 1 << bitToMaskNext;
        bitToMaskNext--;
    }
}
function makeValueBuffer(value) {
    assert_1.default.integer(value);
    assert_1.default(value >= 0, String(value) + ' is negative');
    const bytes = (() => {
        for (const [bytes, maxValue] of UPPER_BOUNDS) {
            if (maxValue > value)
                return bytes;
        }
        throw new Error('Cannot represent ' + String(value)); //should never occur
    })();
    const writeValue = value - UPPER_BOUNDS.get(bytes - 1);
    const buffer = new ArrayBuffer(bytes);
    const castBuffer = new Uint8Array(buffer);
    {
        let shiftedValue = writeValue;
        for (let writeByte = bytes - 1; writeByte >= 0; writeByte--) {
            castBuffer[writeByte] = shiftedValue & 0xFF; //write least significant byte
            //Move next least significant byte to least significant byte
            //Can't use bitwise math here because number may not fit in 32 bits
            shiftedValue = Math.floor(shiftedValue / 0x100);
        }
    }
    castBuffer[0] |= BYTE_MASKS.get(bytes);
    return buffer;
}
exports.makeValueBuffer = makeValueBuffer;
function getByteCount(firstByte) {
    assert_1.default.byteUnsignedInteger(firstByte);
    const leadingOnes = (() => {
        let leadingOnes;
        for (leadingOnes = 0; firstByte & (1 << 7); leadingOnes++) {
            firstByte <<= 1;
        }
        return leadingOnes;
    })();
    const bytes = NUMBER_OF_BYTES.get(leadingOnes);
    assert_1.default(bytes !== undefined, 'Invalid number of bytes');
    return bytes;
}
exports.getByteCount = getByteCount;
function readValueBuffer(valueBuffer) {
    assert_1.default.instanceOf(valueBuffer, ArrayBuffer);
    const bytes = valueBuffer.byteLength;
    assert_1.default(bytes > 0, 'Empty flex int buffer');
    const castBuffer = new Uint8Array(valueBuffer);
    const valueOfPossible = (() => {
        let value = castBuffer[0] ^ BYTE_MASKS.get(bytes);
        for (let byteIndex = 1; byteIndex < bytes; byteIndex++) {
            //Can't use bitwise math here because number may not fit in 32 bits
            value *= 0x100;
            value += castBuffer[byteIndex];
        }
        return value;
    })();
    return UPPER_BOUNDS.get(bytes - 1) + valueOfPossible;
}
exports.readValueBuffer = readValueBuffer;
