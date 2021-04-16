"use strict";
//This file contains functions for reading types from bytes
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports._consumeType = void 0;
const assert = require("./lib/assert");
const constants_1 = require("./lib/constants");
const read_util_1 = require("./lib/read-util");
const util_inspect_1 = require("./lib/util-inspect");
const recursiveRegistry = require("./recursive-registry");
const t = require("./types");
const abstract_1 = require("./types/abstract");
//Types whose type bytes are only 1 byte long (the type byte)
const SINGLE_BYTE_TYPES = [];
{
    const defaultAddToBuffer = abstract_1.default.prototype.addToBuffer;
    const tTypes = t;
    for (const typeName in tTypes) {
        const testType = tTypes[typeName];
        if (testType.prototype.addToBuffer === defaultAddToBuffer)
            SINGLE_BYTE_TYPES.push(testType);
    }
}
//Mapping of type bytes to the corresponding types
const SINGLE_BYTE_TYPE_BYTES = new Map();
for (const singleByteType of SINGLE_BYTE_TYPES) {
    SINGLE_BYTE_TYPE_BYTES.set(singleByteType._value, singleByteType);
}
//Map of type buffers to maps of offsets to deserialized types
const cachedTypeLocations = new WeakMap();
//Number of random characters in synthetic recursive type names
const RECURSIVE_NAME_LENGTH = 16;
//Map of type buffers to maps of ids to synthetic recursive type names
const recursiveNames = new WeakMap();
const stringType = new t.StringType;
//Reads a type from the specified bytes at the specified offset
//Returns the type that was read and the number of bytes consumed
function consumeType(typeBuffer, offset) {
    if (offset < 0)
        throw new RangeError(`Offset is negative: ${offset}`);
    const castBuffer = new Uint8Array(typeBuffer);
    if (typeBuffer.byteLength <= offset)
        throw new Error(read_util_1.NOT_LONG_ENOUGH); //make sure there is a type byte
    let bufferCachedLocations = cachedTypeLocations.get(typeBuffer);
    if (!bufferCachedLocations) {
        cachedTypeLocations.set(typeBuffer, bufferCachedLocations = new Map);
    }
    const typeByte = castBuffer[offset];
    let readType, length = 1; //going to be at least one type byte
    const singleByteType = SINGLE_BYTE_TYPE_BYTES.get(typeByte);
    if (singleByteType)
        readType = new singleByteType;
    else {
        switch (typeByte) {
            case t.BooleanTupleType._value: {
                const tupleLength = read_util_1.readFlexInt(typeBuffer, offset + length);
                length += tupleLength.length;
                readType = new t.BooleanTupleType(tupleLength.value);
                break;
            }
            case t.TupleType._value: {
                const elementType = consumeType(typeBuffer, offset + length);
                length += elementType.length;
                const tupleLength = read_util_1.readFlexInt(typeBuffer, offset + length);
                length += tupleLength.length;
                readType = new t.TupleType({
                    type: elementType.value,
                    length: tupleLength.value
                });
                break;
            }
            case t.StructType._value: {
                const structFields = read_util_1.readFlexInt(typeBuffer, offset + length);
                length += structFields.length;
                const fieldCount = structFields.value;
                const fields = {};
                for (let i = 0; i < fieldCount; i++) { //read field information for each field
                    const fieldName = stringType.consumeValue(typeBuffer, offset + length);
                    length += fieldName.length;
                    const fieldType = consumeType(typeBuffer, offset + length);
                    fields[fieldName.value] = fieldType.value;
                    length += fieldType.length;
                }
                readType = new t.StructType(fields);
                break;
            }
            case t.ArrayType._value: {
                const elementType = consumeType(typeBuffer, offset + length);
                length += elementType.length;
                readType = new t.ArrayType(elementType.value);
                break;
            }
            case t.SetType._value: {
                const elementType = consumeType(typeBuffer, offset + length);
                length += elementType.length;
                readType = new t.SetType(elementType.value);
                break;
            }
            case t.MapType._value: {
                const keyType = consumeType(typeBuffer, offset + length);
                length += keyType.length;
                const valueType = consumeType(typeBuffer, offset + length);
                length += valueType.length;
                readType = new t.MapType(keyType.value, valueType.value);
                break;
            }
            case t.EnumType._value: {
                const valueType = consumeType(typeBuffer, offset + length);
                const subType = valueType.value;
                length += valueType.length;
                const enumCount = read_util_1.readFlexInt(typeBuffer, offset + length);
                length += enumCount.length;
                const valueCount = enumCount.value;
                const values = new Array(valueCount);
                for (let i = 0; i < valueCount; i++) {
                    const valueLocation = offset + length;
                    const enumValue = subType.consumeValue(typeBuffer, valueLocation); //reading values rather than types
                    length += enumValue.length;
                    values[i] = enumValue.value;
                }
                readType = new t.EnumType({ type: subType, values });
                break;
            }
            case t.ChoiceType._value: {
                const choiceCount = read_util_1.readFlexInt(typeBuffer, offset + length);
                length += choiceCount.length;
                const typeCount = choiceCount.value;
                const types = new Array(typeCount);
                for (let i = 0; i < typeCount; i++) {
                    const possibleType = consumeType(typeBuffer, offset + length);
                    types[i] = possibleType.value;
                    length += possibleType.length;
                }
                readType = new t.ChoiceType(types);
                break;
            }
            case t.RecursiveType._value: {
                const idInt = read_util_1.readFlexInt(typeBuffer, offset + length);
                const id = idInt.value;
                length += idInt.length;
                let bufferRecursiveNames = recursiveNames.get(typeBuffer);
                let recursiveName;
                if (bufferRecursiveNames)
                    recursiveName = bufferRecursiveNames.get(id); //see whether this type was previously read
                else {
                    bufferRecursiveNames = new Map;
                    recursiveNames.set(typeBuffer, bufferRecursiveNames);
                }
                if (recursiveName === undefined) { //if we have never read to type yet, the type def must lie here
                    do {
                        recursiveName = 'read-type';
                        for (let charCount = 0; charCount < RECURSIVE_NAME_LENGTH; charCount++) { //add some hex chars
                            recursiveName += Math.floor(Math.random() * 16).toString(16);
                        }
                    } while (recursiveRegistry.isRegistered(recursiveName)); //make sure name doesn't conflict
                    bufferRecursiveNames.set(id, recursiveName); //register type before reading type definition so it can refer to this recursive type
                    const subType = consumeType(typeBuffer, offset + length);
                    length += subType.length;
                    recursiveRegistry.registerType({
                        type: subType.value,
                        name: recursiveName
                    });
                }
                /*If we have already read the type, then we are either reading a recursive type without the type def
                    or we are reading a repeated type (in which case we don't have to care about the length of the read)
                    so we can safely reuse old value*/
                readType = new t.RecursiveType(recursiveName);
                break;
            }
            case t.SingletonType._value: {
                const valueType = consumeType(typeBuffer, offset + length);
                length += valueType.length;
                const subType = valueType.value;
                const value = subType.consumeValue(typeBuffer, offset + length);
                length += value.length;
                readType = new t.SingletonType({ type: subType, value: value.value });
                break;
            }
            case t.OptionalType._value: {
                const subType = consumeType(typeBuffer, offset + length);
                length += subType.length;
                readType = new t.OptionalType(subType.value);
                break;
            }
            case t.PointerType._value: {
                const subType = consumeType(typeBuffer, offset + length);
                length += subType.length;
                readType = new t.PointerType(subType.value);
                break;
            }
            case constants_1.REPEATED_TYPE: {
                const locationOffset = read_util_1.readFlexInt(typeBuffer, offset + length);
                const location = offset - locationOffset.value;
                const type = bufferCachedLocations.get(location);
                if (!type)
                    throw new Error(`No type was read at offset ${location}`);
                readType = type;
                length += locationOffset.length;
                break;
            }
            default:
                throw new Error(`No such type: 0x${util_inspect_1.hexByte(castBuffer[offset])}`);
        }
    }
    bufferCachedLocations.set(offset, readType);
    return { value: readType, length };
}
exports._consumeType = consumeType;
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
 * @param typeBuffer The buffer containing the type bytes
 * @param fullBuffer Whether to assert that the whole buffer was read.
 * In most use cases, this argument should be be omitted.
 * @return The type that was read
 */
function type(typeBuffer, fullBuffer = true) {
    assert.instanceOf(typeBuffer, [ArrayBuffer, Uint8Array]);
    let readBuffer, readOffset;
    if (typeBuffer instanceof ArrayBuffer) {
        readBuffer = typeBuffer;
        readOffset = 0;
    }
    else {
        readBuffer = typeBuffer.buffer;
        readOffset = typeBuffer.byteOffset;
    }
    const { value, length } = consumeType(readBuffer, readOffset);
    if (fullBuffer && length !== typeBuffer.byteLength) {
        throw new Error('Did not consume all of the buffer');
    }
    return value;
}
exports.type = type;
