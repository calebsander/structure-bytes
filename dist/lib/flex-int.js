"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * See [[FlexUnsignedIntType]] for an explanation
 * of the `flexInt` format
 */
const assert_1 = require("./assert");
function possibleValueCount(bytes) {
    const usableBits = 7 * bytes;
    return Math.pow(2, usableBits); //can't bit-shift because this may not fit in 32-bit integer
}
const UPPER_BOUNDS = new Map(); //mapping of numbers of bytes to the exclusive upper bound on numbers in the range
{
    let cumulativeValues = 0;
    let bytes = 1;
    while (true) {
        cumulativeValues += possibleValueCount(bytes);
        UPPER_BOUNDS.set(bytes, cumulativeValues);
        if (cumulativeValues > Number.MAX_SAFE_INTEGER)
            break;
        bytes++;
    }
}
//Mapping of the number of leading ones in the first byte's mask to the number of bytes
const NUMBER_OF_BYTES = new Map();
//Mapping of numbers of bytes to the mask for the first byte
//Goes 0b00000000, 0b10000000, 0b11000000, etc.
const BYTE_MASKS = new Map();
{
    let mask = -256; //0b111...100000000 in 2's complement
    for (const bytes of UPPER_BOUNDS.keys()) {
        BYTE_MASKS.set(bytes, mask & 0xFF);
        NUMBER_OF_BYTES.set(bytes - 1, bytes);
        mask >>= 1; //converts the most significant 0 to a 1
    }
}
/**
 * Represents the input by its unique `flexInt` format
 * @param value A non-negative JavaScript integer value
 * @return An `ArrayBuffer` containing 1 to 8 bytes
 */
function makeValueBuffer(value) {
    assert_1.default.integer(value);
    assert_1.default(value >= 0, String(value) + ' is negative');
    const bytes = (() => {
        for (const [byteCount, maxValue] of UPPER_BOUNDS) {
            if (value < maxValue)
                return byteCount;
        }
        /*istanbul ignore next*/
        throw new Error('Cannot represent ' + String(value)); //should never occur
    })();
    const writeValue = value - (UPPER_BOUNDS.get(bytes - 1) || 0);
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
/**
 * Gets the number of bytes taken up by a `flexInt`,
 * given its first byte, so the slice of the buffer containing
 * the `flexInt` can be extracted
 * @param firstByte The first byte of the `flexInt`
 * @return The length of the `flexInt`
 */
function getByteCount(firstByte) {
    assert_1.default.byteUnsignedInteger(firstByte);
    let leadingOnes;
    for (leadingOnes = 0; firstByte & (1 << 7); leadingOnes++)
        firstByte <<= 1;
    const bytes = NUMBER_OF_BYTES.get(leadingOnes);
    assert_1.default(bytes !== undefined, 'Invalid number of bytes');
    return bytes;
}
exports.getByteCount = getByteCount;
/**
 * Converts a binary `flexInt` representation
 * into the number it stores.
 * The inverse of [[makeValueBuffer]].
 * @param valueBuffer The binary `flexInt` representation
 * @return The number used to generate the `flexInt` buffer
 */
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
    return (UPPER_BOUNDS.get(bytes - 1) || 0) + valueOfPossible;
}
exports.readValueBuffer = readValueBuffer;
