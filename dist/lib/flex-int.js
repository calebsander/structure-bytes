"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * See [[FlexUnsignedIntType]] for an explanation
 * of the `flexInt` format
 */
const assert = require("./assert");
function possibleValueCount(bytes) {
    const usableBits = 7 * bytes;
    return Math.pow(2, usableBits); //can't bit-shift because this may not fit in 32-bit integer
}
const UPPER_BOUNDS = new Map() //mapping of numbers of bytes to the exclusive upper bound on numbers in the range
    .set(0, 0); //1-byte values are relative to 0
//Mapping of numbers of bytes to the mask for the first byte
//Goes 0b00000000, 0b10000000, 0b11000000, etc.
const BYTE_MASKS = new Map();
//Mapping of the number of leading ones in the first byte's mask to the number of bytes
const NUMBER_OF_BYTES = new Map();
{
    let bytes = 1;
    let cumulativeValues = 0;
    let mask = ~0xFF; //0b111...100000000 in 2's complement
    while (cumulativeValues <= Number.MAX_SAFE_INTEGER) {
        cumulativeValues += possibleValueCount(bytes);
        UPPER_BOUNDS.set(bytes, cumulativeValues);
        BYTE_MASKS.set(bytes, mask & 0xFF);
        NUMBER_OF_BYTES.set(bytes - 1, bytes);
        mask >>= 1; //converts the most significant 0 to a 1
        bytes++;
    }
}
/**
 * Represents the input by its unique `flexInt` format
 * @param value A non-negative JavaScript integer value
 * @return An `ArrayBuffer` containing 1 to 8 bytes
 */
function makeValueBuffer(value) {
    assert.integer(value);
    if (value < 0)
        throw new RangeError(`${value} is negative`);
    const bytes = (() => {
        for (const [byteCount, maxValue] of UPPER_BOUNDS) {
            if (maxValue > value)
                return byteCount;
        }
        /*istanbul ignore next*/
        throw new Error(`Cannot represent ${value}`); //should never occur
    })();
    let writeValue = value - UPPER_BOUNDS.get(bytes - 1);
    const buffer = new Uint8Array(bytes);
    for (let writeByte = bytes - 1; writeByte >= 0; writeByte--) {
        buffer[writeByte] = writeValue & 0xFF; //write least significant byte
        //Move next least significant byte to least significant byte
        //Can't use bitwise math here because number may not fit in 32 bits
        writeValue = Math.floor(writeValue / 0x100);
    }
    buffer[0] |= BYTE_MASKS.get(bytes);
    return buffer.buffer;
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
    const leadingOnes = Math.clz32(~firstByte << 24);
    const bytes = NUMBER_OF_BYTES.get(leadingOnes);
    if (!bytes)
        throw new Error('Invalid number of bytes');
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
    assert.instanceOf(valueBuffer, ArrayBuffer);
    const bytes = valueBuffer.byteLength;
    if (!bytes)
        throw new Error('Empty flex int buffer');
    const castBuffer = new Uint8Array(valueBuffer);
    let relativeValue = castBuffer[0] ^ BYTE_MASKS.get(bytes);
    for (let byteIndex = 1; byteIndex < bytes; byteIndex++) {
        //Can't use bitwise math here because number may not fit in 32 bits
        relativeValue = relativeValue * 0x100 + castBuffer[byteIndex];
    }
    return UPPER_BOUNDS.get(bytes - 1) + relativeValue;
}
exports.readValueBuffer = readValueBuffer;
