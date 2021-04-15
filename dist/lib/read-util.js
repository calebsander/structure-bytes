"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
 * Reads a byte from the buffer,
 * requires it to be `0x00` or `0xFF`,
 * and returns its boolean value
 * @param buffer The buffer to read from
 * @param offset The position in `buffer`
 * of the byte to read
 * @return `true` if the byte is `0xFF`,
 * `false` if it is `0x00`
 */
function readBooleanByte(buffer, offset) {
    if (buffer.byteLength <= offset)
        throw new Error(exports.NOT_LONG_ENOUGH);
    let value;
    const readByte = new Uint8Array(buffer)[offset];
    switch (readByte) {
        case 0x00:
        case 0xFF:
            value = !!readByte;
            break;
        default:
            throw new Error(`0x${util_inspect_1.hexByte(readByte)} is an invalid Boolean value`);
    }
    return { value, length: 1 };
}
exports.readBooleanByte = readBooleanByte;
/**
 * Inverse of `writeBooleans()`, i.e. reads
 * a given number of booleans from binary data
 * @param buffer The bytes to read from
 * @param offset The position in `buffer`
 * of the first byte containing the booleans
 * @param count The number of boolean values to read
 * @return The array of booleans read
 */
function readBooleans({ buffer, offset, count }) {
    const value = new Array(count);
    const incompleteBytes = bit_math_1.modEight(count);
    const bytes = bit_math_1.dividedByEight(count);
    const length = incompleteBytes ? bytes + 1 : bytes;
    if (buffer.byteLength < offset + length)
        throw new Error(exports.NOT_LONG_ENOUGH);
    const castBuffer = new Uint8Array(buffer, offset);
    for (let i = 0; i < length; i++) {
        const byte = castBuffer[i];
        for (let bit = 0; bit < 8; bit++) {
            const index = bit_math_1.timesEight(i) | bit;
            if (index === count)
                break;
            value[index] = Boolean(byte & (1 << (7 - bit)));
        }
    }
    return { value, length };
}
exports.readBooleans = readBooleans;
/**
 * Reads an unsigned integer in `flexInt` format
 * @param buffer The binary data to read from
 * @param offset The position of the first byte
 * of the `flexInt`
 * @return The number stored in the `flexInt`
 */
function readFlexInt(buffer, offset) {
    if (buffer.byteLength <= offset)
        throw new Error(exports.NOT_LONG_ENOUGH);
    const castBuffer = new Uint8Array(buffer, offset);
    const length = flexInt.getByteCount(castBuffer[0]);
    if (buffer.byteLength < offset + length)
        throw new Error(exports.NOT_LONG_ENOUGH);
    return {
        value: flexInt.readValueBuffer(castBuffer.slice(0, length).buffer),
        length
    };
}
exports.readFlexInt = readFlexInt;
/**
 * Reads a signed long
 * @param buffer The binary data to read from
 * @param offset The position of the first byte to read
 * @return The value stored in the `8` bytes
 * starting at `offset`, in string form
 */
function readLong(buffer, offset) {
    const length = 8;
    if (buffer.byteLength < offset + length)
        throw new Error(exports.NOT_LONG_ENOUGH);
    return { value: new DataView(buffer, offset).getBigInt64(0), length };
}
exports.readLong = readLong;
/**
 * Creates an [[AbstractType.consumeValue]] method
 * for a type corresponding to an element of a `TypedArray`.
 * @param func The `DataView.get*` method,
 * e.g. `'getUint8'`
 * @param type The corresponding `TypedArray` constructor,
 * e.g. `Uint8Array`
 * @return A function that takes in an `ArrayBuffer`
 * and an offset in the buffer and reads a `number`,
 * much like [[AbstractType.consumeValue]]
 */
function readNumber({ func, type }) {
    const length = type.BYTES_PER_ELEMENT;
    return (buffer, offset) => {
        if (buffer.byteLength < offset + length)
            throw new Error(exports.NOT_LONG_ENOUGH);
        return {
            value: new DataView(buffer)[func](offset),
            length
        };
    };
}
exports.readNumber = readNumber;
