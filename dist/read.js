"use strict";
//This file contains functions for reading types from bytes
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.consumeType = void 0;
const assert = require("./lib/assert");
const constants_1 = require("./lib/constants");
const read_util_1 = require("./lib/read-util");
const util_inspect_1 = require("./lib/util-inspect");
const recursiveRegistry = require("./recursive-registry");
const t = require("./types");
const abstract_1 = require("./types/abstract");
//Map of type buffers to maps of offsets to deserialized types.
//Used to implement reading REPEATED_TYPE.
const cachedTypeLocations = new WeakMap();
//Number of random characters in synthetic recursive type names
const RECURSIVE_NAME_LENGTH = 16;
//Map of type buffers to maps of ids to synthetic recursive type names
const recursiveNames = new WeakMap();
const stringType = new t.StringType;
//A sparse array indexed by type bytes, whose entries are TypeReaders for those types.
const TYPE_READERS = new Array(256);
//Add readers for all types that don't have any parameters
{
    const defaultAddToBuffer = abstract_1.default.prototype.addToBuffer;
    const tTypes = t;
    for (const typeName in tTypes) {
        const testType = tTypes[typeName];
        if (testType.prototype.addToBuffer === defaultAddToBuffer) {
            const singleByteType = testType;
            TYPE_READERS[testType._value] = () => new singleByteType;
        }
    }
}
//Add readers for types that take additional parameters
TYPE_READERS[t.BooleanTupleType._value] = bufferOffset => {
    const tupleLength = read_util_1.readFlexInt(bufferOffset);
    return new t.BooleanTupleType(tupleLength);
};
TYPE_READERS[t.TupleType._value] = bufferOffset => {
    const type = exports.consumeType(bufferOffset);
    const length = read_util_1.readFlexInt(bufferOffset);
    return new t.TupleType({ type, length });
};
TYPE_READERS[t.StructType._value] = bufferOffset => {
    const fieldCount = read_util_1.readFlexInt(bufferOffset);
    const fields = {};
    for (let i = 0; i < fieldCount; i++) { //read field information for each field
        const fieldName = stringType.consumeValue(bufferOffset);
        fields[fieldName] = exports.consumeType(bufferOffset);
    }
    return new t.StructType(fields);
};
TYPE_READERS[t.ArrayType._value] = bufferOffset => {
    const elementType = exports.consumeType(bufferOffset);
    return new t.ArrayType(elementType);
};
TYPE_READERS[t.SetType._value] = bufferOffset => {
    const elementType = exports.consumeType(bufferOffset);
    return new t.SetType(elementType);
};
TYPE_READERS[t.MapType._value] = bufferOffset => {
    const keyType = exports.consumeType(bufferOffset);
    const valueType = exports.consumeType(bufferOffset);
    return new t.MapType(keyType, valueType);
};
TYPE_READERS[t.EnumType._value] = bufferOffset => {
    const type = exports.consumeType(bufferOffset);
    const valueCount = read_util_1.readFlexInt(bufferOffset);
    const values = new Array(valueCount);
    for (let i = 0; i < valueCount; i++) {
        values[i] = type.consumeValue(bufferOffset); //reading values rather than types
    }
    return new t.EnumType({ type, values });
};
TYPE_READERS[t.ChoiceType._value] = bufferOffset => {
    const typeCount = read_util_1.readFlexInt(bufferOffset);
    const types = new Array(typeCount);
    for (let i = 0; i < typeCount; i++) {
        types[i] = exports.consumeType(bufferOffset);
    }
    return new t.ChoiceType(types);
};
TYPE_READERS[t.RecursiveType._value] = bufferOffset => {
    const id = read_util_1.readFlexInt(bufferOffset);
    const { buffer } = bufferOffset;
    let bufferRecursiveNames = recursiveNames.get(buffer);
    if (!bufferRecursiveNames) {
        recursiveNames.set(buffer, bufferRecursiveNames = new Map);
    }
    let name = bufferRecursiveNames.get(id); //see whether this type was previously read
    if (name === undefined) { //if we have never read to type yet, the type def must lie here
        do {
            name = 'read-type';
            for (let charCount = 0; charCount < RECURSIVE_NAME_LENGTH; charCount++) { //add some hex chars
                name += Math.floor(Math.random() * 16).toString(16);
            }
        } while (recursiveRegistry.isRegistered(name)); //make sure name doesn't conflict
        bufferRecursiveNames.set(id, name); //register type before reading type definition so it can refer to this recursive type
        const type = exports.consumeType(bufferOffset);
        recursiveRegistry.registerType({ type, name });
    }
    /*If we have already read the type, then we are either reading a recursive type without the type def
        or we are reading a repeated type (in which case we don't have to care about the length of the read)
        so we can safely reuse old value*/
    return new t.RecursiveType(name);
};
TYPE_READERS[t.SingletonType._value] = bufferOffset => {
    const type = exports.consumeType(bufferOffset);
    const value = type.consumeValue(bufferOffset);
    return new t.SingletonType({ type, value });
};
TYPE_READERS[t.OptionalType._value] = bufferOffset => {
    const type = exports.consumeType(bufferOffset);
    return new t.OptionalType(type);
};
TYPE_READERS[t.PointerType._value] = bufferOffset => {
    const type = exports.consumeType(bufferOffset);
    return new t.PointerType(type);
};
TYPE_READERS[constants_1.REPEATED_TYPE] = bufferOffset => {
    const { buffer, offset } = bufferOffset;
    const locationOffset = read_util_1.readFlexInt(bufferOffset);
    const location = offset - 1 - locationOffset; //move back to the type byte, then by locationOffset
    const bufferCachedLocations = cachedTypeLocations.get(buffer);
    if (!bufferCachedLocations)
        throw new Error('Buffer has no repeated types');
    const type = bufferCachedLocations.get(location);
    if (!type)
        throw new Error(`No type was read at offset ${location}`);
    return type;
};
/**
 * Reads a type from a buffer and advances its offset
 * @param bufferOffset The buffer and its current offset
 * @return The deserialized type
 */
const consumeType = bufferOffset => {
    const { offset } = bufferOffset;
    if (offset < 0)
        throw new RangeError(`Offset is negative: ${offset}`);
    const [typeByte] = read_util_1.readBytes(bufferOffset, 1);
    const typeReader = TYPE_READERS[typeByte];
    if (!typeReader)
        throw new Error(`No such type: 0x${util_inspect_1.hexByte(typeByte)}`);
    const result = typeReader(bufferOffset);
    //Record the type that was read at this offset
    const { buffer } = bufferOffset;
    let bufferCachedLocations = cachedTypeLocations.get(buffer);
    if (!bufferCachedLocations) {
        cachedTypeLocations.set(buffer, bufferCachedLocations = new Map);
    }
    bufferCachedLocations.set(offset, result);
    return result;
};
exports.consumeType = consumeType;
/**
 * Deserializes a type, i.e. takes a buffer
 * containing its binary form and creates the type object.
 * The inverse of calling [[Type.toBuffer]].
 *
 * Example:
 * ````javascript
 * let type = new sb.ArrayType(
 *   new sb.FlexUnsignedIntType
 * )
 * let typeBuffer = type.toBuffer()
 * let readType = sb.r.type(typeBuffer)
 * console.log(readType) // ArrayType { type: FlexUnsignedIntType {} }
 * ````
 *
 * @param buffer The buffer containing the type bytes
 * @param fullBuffer Whether to assert that the whole buffer was read.
 * In most use cases, this argument should be be omitted.
 * @return The type that was read
 */
function type(buffer, fullBuffer = true) {
    assert.instanceOf(buffer, [ArrayBuffer, Uint8Array]);
    const bufferOffset = buffer instanceof ArrayBuffer
        ? { buffer, offset: 0 }
        : { buffer: buffer.buffer, offset: buffer.byteOffset };
    const { offset } = bufferOffset;
    const value = exports.consumeType(bufferOffset);
    if (fullBuffer && bufferOffset.offset !== offset + buffer.byteLength) {
        throw new Error('Did not consume all of the buffer');
    }
    return value;
}
exports.type = type;
