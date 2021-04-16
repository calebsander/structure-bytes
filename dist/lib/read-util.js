"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUnsignedInt = exports.readNumber = exports.readLong = exports.readFlexInt = exports.readBooleans = exports.readBooleanByte = exports.readBytes = exports.makeBaseValue = exports.NOT_LONG_ENOUGH = void 0;
const bit_math_1 = require("./bit-math");
const flexInt = require("./flex-int");
const util_inspect_1 = require("./util-inspect");
const array_1 = require("../types/array");
const map_1 = require("../types/map");
const set_1 = require("../types/set");
const struct_1 = require("../types/struct");
const tuple_1 = require("../types/tuple");
exports.NOT_LONG_ENOUGH = 'Buffer is not long enough';
/**
 * Creates a value that can be mutated into a read value
 * for the given [[Type]].
 * This allows a reference to the read value to be used
 * before the read value is populated.
 * @param readType The [[Type]] reading a value
 * @param count If an [[ArrayType]], must pass in a length
 * to initialize the array value with
 * @return `[]`, `new Map`, `new Set`, or `{}`
 */
function makeBaseValue(readType, count) {
    switch (readType.constructor) {
        case array_1.ArrayType: return new Array(count);
        case tuple_1.TupleType: return new Array(readType.length);
        case map_1.MapType: return new Map;
        case set_1.SetType: return new Set;
        case struct_1.StructType: return {};
        /*istanbul ignore next*/
        default: throw new Error('Invalid type for base value: ' + util_inspect_1.inspect(readType));
    }
}
exports.makeBaseValue = makeBaseValue;
/**
 * Reads a given number of bytes at the given buffer offset
 * and advances the offset in the buffer
 * @param bufferOffset The buffer and its current offset
 * @param length The number of bytes to read
 * @return A Uint8Array view of the read bytes
 */
function readBytes(bufferOffset, length) {
    const { buffer, offset } = bufferOffset;
    const newOffset = offset + length;
    if (buffer.byteLength < newOffset)
        throw new Error(exports.NOT_LONG_ENOUGH);
    bufferOffset.offset = newOffset;
    return new Uint8Array(buffer, offset, length);
}
exports.readBytes = readBytes;
/**
 * Reads a byte from the buffer,
 * requires it to be `0x00` or `0xFF`,
 * and returns its boolean value
 * @param bufferOffset The buffer and its current offset, the byte to read
 * @return `true` if the byte is `0xFF`,
 * `false` if it is `0x00`
 */
function readBooleanByte(offset) {
    const [readByte] = readBytes(offset, 1);
    switch (readByte) {
        case 0x00:
        case 0xFF:
            return !!readByte;
        default:
            throw new Error(`0x${util_inspect_1.hexByte(readByte)} is an invalid Boolean value`);
    }
}
exports.readBooleanByte = readBooleanByte;
/**
 * Inverse of `writeBooleans()`, i.e. reads
 * a given number of booleans from binary data
 * @param bufferOffset The buffer and its current offset, the first byte of booleans
 * @param count The number of boolean values to read
 * @return The array of booleans read
 */
function readBooleans({ bufferOffset, count }) {
    const value = new Array(count);
    const incompleteBytes = bit_math_1.modEight(count);
    const fullBytes = bit_math_1.dividedByEight(count);
    const length = incompleteBytes ? fullBytes + 1 : fullBytes;
    const bytes = readBytes(bufferOffset, length);
    for (let i = 0; i < length; i++) {
        const byte = bytes[i];
        for (let bit = 0; bit < 8; bit++) {
            const index = bit_math_1.timesEight(i) | bit;
            if (index === count)
                break;
            value[index] = Boolean(byte >> (7 - bit) & 1);
        }
    }
    return value;
}
exports.readBooleans = readBooleans;
/**
 * Reads an unsigned integer in `flexInt` format
 * @param bufferOffset The buffer and its current offset, the first byte of the `flexInt`
 * @return The number stored in the `flexInt`
 */
function readFlexInt(bufferOffset) {
    const { offset } = bufferOffset;
    const [firstByte] = readBytes(bufferOffset, 1);
    bufferOffset.offset = offset;
    const length = flexInt.getByteCount(firstByte);
    const bytes = readBytes(bufferOffset, length);
    return flexInt.readValueBuffer(bytes);
}
exports.readFlexInt = readFlexInt;
/**
 * Reads a signed long
 * @param bufferOffset The buffer and its current offset
 * @return The value stored in the `8` bytes
 * starting at `bufferOffset.offset`, in string form
 */
function readLong(bufferOffset) {
    const { buffer, offset } = bufferOffset;
    readBytes(bufferOffset, 8);
    return new DataView(buffer).getBigInt64(offset);
}
exports.readLong = readLong;
/**
 * Creates an [[AbstractType.consumeValue]] method
 * for a type corresponding to an element of a `TypedArray`.
 * @param func The `DataView.get*` method,
 * e.g. `'getUint8'`
 * @param type The corresponding `TypedArray` constructor,
 * e.g. `Uint8Array`
 * @return A function that takes in a [[BufferOffset]] and reads a `number`,
 * much like [[AbstractType.consumeValue]]
 */
function readNumber({ func, type }) {
    const length = type.BYTES_PER_ELEMENT;
    return bufferOffset => {
        const { buffer, offset } = bufferOffset;
        readBytes(bufferOffset, length);
        return new DataView(buffer)[func](offset);
    };
}
exports.readNumber = readNumber;
/**
 * Reads an unsigned 32-bit integer from a buffer
 * @param bufferOffset The buffer and its current offset
 * @return The integer read from the buffer
 */
exports.readUnsignedInt = readNumber({ type: Uint32Array, func: 'getUint32' });
