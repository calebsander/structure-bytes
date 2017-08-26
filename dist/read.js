"use strict";
//This file contains functions for reading types and values from bytes
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./lib/assert");
const bit_math_1 = require("./lib/bit-math");
const bufferString = require("./lib/buffer-string");
const constants_1 = require("./lib/constants");
const constructorRegistry = require("./lib/constructor-registry");
const date = require("./lib/date");
const flexInt = require("./lib/flex-int");
const strint = require("./lib/strint");
const util_inspect_1 = require("./lib/util-inspect");
const recursiveRegistry = require("./recursive-registry");
const t = require("./types");
const abstract_1 = require("./types/abstract");
const NOT_LONG_ENOUGH = 'Buffer is not long enough';
function readFlexInt(buffer, offset) {
    assert_1.default(buffer.byteLength > offset, NOT_LONG_ENOUGH);
    const length = flexInt.getByteCount(new Uint8Array(buffer)[offset]);
    assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
    return {
        value: flexInt.readValueBuffer(buffer.slice(offset, offset + length)),
        length
    };
}
//Types whose type bytes are only 1 byte long (the type byte)
const SINGLE_BYTE_TYPES = new Set([
    t.ByteType,
    t.ShortType,
    t.IntType,
    t.LongType,
    t.BigIntType,
    t.UnsignedByteType,
    t.UnsignedShortType,
    t.UnsignedIntType,
    t.UnsignedLongType,
    t.BigUnsignedIntType,
    t.FlexUnsignedIntType,
    t.DateType,
    t.DayType,
    t.TimeType,
    t.FloatType,
    t.DoubleType,
    t.BooleanType,
    t.BooleanArrayType,
    t.CharType,
    t.StringType,
    t.OctetsType
]);
//Mapping of type bytes to the corresponding types
const SINGLE_BYTE_TYPE_BYTES = new Map();
for (const singleByteType of SINGLE_BYTE_TYPES) {
    SINGLE_BYTE_TYPE_BYTES.set(singleByteType._value, singleByteType);
}
//Pads a string with preceding 0s so that it has the desired length (for error messages)
function pad(str, digits) {
    if (str.length < digits)
        return '0'.repeat(digits - str.length) + str;
    else
        return str;
}
//Returns an object to which keys are added when reading an instance of the specified type
//This allows the reference to the read value to be used before it is populated
function makeBaseValue(readType, count) {
    switch (readType.constructor) {
        case t.ArrayType: {
            return new Array(count);
        }
        case t.TupleType: {
            return new Array(readType.length);
        }
        case t.MapType: {
            return new Map;
        }
        case t.SetType: {
            return new Set;
        }
        case t.StructType: {
            return {};
        }
        /*istanbul ignore next*/
        default: throw new Error('Invalid type for base value: ' + util_inspect_1.inspect(readType));
    }
}
//Counterpart for writeBooleans() in structure-types.ts
function readBooleans({ buffer, offset, count, baseValue }) {
    const readValue = baseValue || new Array(count);
    const incompleteBytes = bit_math_1.modEight(readValue.length);
    const bytes = bit_math_1.dividedByEight(readValue.length);
    let byteLength;
    if (incompleteBytes)
        byteLength = bytes + 1;
    else
        byteLength = bytes;
    assert_1.default(buffer.byteLength >= offset + byteLength, NOT_LONG_ENOUGH);
    const castBuffer = new Uint8Array(buffer);
    for (let i = 0; i < byteLength; i++) {
        const byte = castBuffer[offset + i];
        for (let bit = 0; bit < 8; bit++) {
            const index = i * 8 + bit;
            if (index === readValue.length)
                break;
            readValue[index] = !!(byte & (1 << bit_math_1.modEight(~bit_math_1.modEight(bit))));
        }
    }
    return { value: readValue, length: byteLength };
}
//Requires that a byte by 0x00 or 0xFF and returns its boolean value
function readBooleanByte(buffer, offset) {
    assert_1.default(buffer.byteLength > offset, NOT_LONG_ENOUGH);
    let readValue;
    const readByte = new Uint8Array(buffer)[offset];
    switch (readByte) {
        case 0x00:
        case 0xFF:
            readValue = Boolean(readByte);
            break;
        default:
            throw new Error('0x' + pad(readByte.toString(16), 2) + ' is an invalid Boolean value');
    }
    return { value: readValue, length: 1 };
}
//Map of value buffers to maps of indices to read values for recursive types
const readRecursives = new WeakMap();
//Map of read value buffers to maps of pointer types to maps of pointer values to read results
const pointerReads = new WeakMap();
/*
    Reads a value from the specified bytes at the specified offset, given a type
    Returns the value that was read and the number of bytes consumed (excepting any values being pointed to)
    Pointer start refers to the position in the buffer where the root value starts
    (pointers will be relative to this location)
*/
function consumeValue({ buffer, pointerStart, offset, type: readType, baseValue }) {
    let readValue, length;
    switch (readType.constructor) {
        case t.ByteType: {
            length = 1;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            readValue = new Int8Array(buffer)[offset]; //endianness doesn't matter because there is only 1 byte
            break;
        }
        case t.ShortType: {
            length = 2;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            const dataView = new DataView(buffer);
            readValue = dataView.getInt16(offset);
            break;
        }
        case t.IntType: {
            length = 4;
            const dataView = new DataView(buffer);
            readValue = dataView.getInt32(offset);
            break;
        }
        case t.LongType:
        case t.DateType: {
            length = 8;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            const dataView = new DataView(buffer);
            const upper = dataView.getInt32(offset);
            const lower = dataView.getUint32(offset + 4);
            readValue = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower));
            if (readType.constructor === t.DateType)
                readValue = new Date(Number(readValue));
            break;
        }
        case t.BigIntType: {
            const lengthInt = readFlexInt(buffer, offset);
            const bytes = lengthInt.value;
            ({ length } = lengthInt);
            assert_1.default(buffer.byteLength >= offset + length + bytes, NOT_LONG_ENOUGH);
            const dataView = new DataView(buffer);
            if (bytes) {
                readValue = String(dataView.getInt8(offset + length));
                for (let byte = 1; byte < bytes; byte++) {
                    readValue = strint.mul(readValue, strint.BYTE_SHIFT); //after the first byte, shift everything left one byte before adding
                    readValue = strint.add(readValue, String(dataView.getUint8(offset + length + byte)));
                }
            }
            else
                readValue = '0';
            length += bytes;
            break;
        }
        case t.UnsignedByteType: {
            length = 1;
            assert_1.default(buffer.byteLength > offset, NOT_LONG_ENOUGH);
            readValue = new Uint8Array(buffer)[offset]; //endianness doesn't matter because there is only 1 byte
            break;
        }
        case t.UnsignedShortType: {
            length = 2;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            readValue = new DataView(buffer).getUint16(offset);
            break;
        }
        case t.UnsignedIntType: {
            length = 4;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            readValue = new DataView(buffer).getUint32(offset);
            break;
        }
        case t.UnsignedLongType: {
            length = 8;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            const dataView = new DataView(buffer);
            const upper = dataView.getUint32(offset);
            const lower = dataView.getUint32(offset + 4);
            readValue = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower));
            break;
        }
        case t.BigUnsignedIntType: {
            const lengthInt = readFlexInt(buffer, offset);
            const bytes = lengthInt.value;
            ({ length } = lengthInt);
            assert_1.default(buffer.byteLength >= offset + length + bytes, NOT_LONG_ENOUGH);
            const castBuffer = new Uint8Array(buffer);
            readValue = '0';
            for (let byte = 0; byte < bytes; byte++, length++) {
                if (byte)
                    readValue = strint.mul(readValue, strint.BYTE_SHIFT); //after the first byte, shift everything left one byte before adding
                readValue = strint.add(readValue, String(castBuffer[offset + length]));
            }
            break;
        }
        case t.FlexUnsignedIntType: {
            ({ value: readValue, length } = readFlexInt(buffer, offset));
            break;
        }
        case t.DayType: {
            length = 3;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            const dataView = new DataView(buffer);
            const day = (dataView.getInt16(offset) << 8) | dataView.getUint8(offset + 2);
            readValue = date.fromUTC(day * date.MILLIS_PER_DAY);
            break;
        }
        case t.TimeType: {
            length = 4;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            readValue = new Date(new DataView(buffer).getUint32(offset));
            break;
        }
        case t.FloatType: {
            length = 4;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            readValue = new DataView(buffer).getFloat32(offset);
            break;
        }
        case t.DoubleType: {
            length = 8;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            readValue = new DataView(buffer).getFloat64(offset);
            break;
        }
        case t.BooleanType: {
            ({ value: readValue, length } = readBooleanByte(buffer, offset));
            break;
        }
        case t.BooleanArrayType: {
            const arrayLength = readFlexInt(buffer, offset);
            ({ length } = arrayLength);
            const booleans = readBooleans({ buffer, offset: offset + length, count: arrayLength.value, baseValue });
            length += booleans.length;
            readValue = booleans.value;
            break;
        }
        case t.BooleanTupleType: {
            ({ value: readValue, length } = readBooleans({
                buffer,
                offset,
                count: readType.length, baseValue
            }));
            break;
        }
        case t.CharType: {
            assert_1.default(buffer.byteLength > offset, NOT_LONG_ENOUGH);
            readValue = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + 4))[0]; //UTF-8 codepoint can't be more than 4 bytes
            length = bufferString.fromString(readValue).byteLength;
            break;
        }
        case t.StringType: {
            const castBuffer = new Uint8Array(buffer);
            for (length = 0;; length++) {
                assert_1.default(buffer.byteLength > offset + length, NOT_LONG_ENOUGH);
                if (!castBuffer[offset + length])
                    break;
            }
            readValue = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + length));
            length++; //account for null byte
            break;
        }
        case t.OctetsType: {
            const octetsLength = readFlexInt(buffer, offset);
            ({ length } = octetsLength);
            const finalLength = length + octetsLength.value;
            assert_1.default(buffer.byteLength >= offset + finalLength, NOT_LONG_ENOUGH);
            readValue = buffer.slice(offset + length, offset + finalLength);
            length = finalLength;
            break;
        }
        case t.TupleType: {
            length = 0;
            const castType = readType;
            readValue = baseValue || makeBaseValue(castType);
            for (let i = 0; i < castType.length; i++) {
                const element = consumeValue({ buffer, pointerStart, offset: offset + length, type: castType.type });
                length += element.length;
                readValue[i] = element.value;
            }
            break;
        }
        case t.StructType: {
            length = 0;
            const castType = readType;
            readValue = baseValue || makeBaseValue(castType);
            for (const field of castType.fields) {
                const readField = consumeValue({ buffer, pointerStart, offset: offset + length, type: field.type });
                readValue[field.name] = readField.value;
                length += readField.length;
            }
            break;
        }
        case t.ArrayType: {
            const arrayLengthInt = readFlexInt(buffer, offset);
            const arrayLength = arrayLengthInt.value;
            ({ length } = arrayLengthInt);
            const castType = readType;
            readValue = baseValue || makeBaseValue(castType, arrayLength);
            for (let i = 0; i < arrayLength; i++) {
                const element = consumeValue({ buffer, pointerStart, offset: offset + length, type: castType.type });
                length += element.length;
                readValue[i] = element.value;
            }
            break;
        }
        case t.SetType: {
            const size = readFlexInt(buffer, offset);
            const setSize = size.value;
            ({ length } = size);
            const castType = readType;
            readValue = baseValue || makeBaseValue(castType);
            for (let i = 0; i < setSize; i++) {
                const element = consumeValue({ buffer, pointerStart, offset: offset + length, type: castType.type });
                length += element.length;
                readValue.add(element.value);
            }
            break;
        }
        case t.MapType: {
            const size = readFlexInt(buffer, offset);
            ({ length } = size);
            const castType = readType;
            readValue = baseValue || makeBaseValue(castType);
            for (let i = 0; i < size.value; i++) {
                const keyElement = consumeValue({ buffer, pointerStart, offset: offset + length, type: castType.keyType });
                length += keyElement.length;
                const valueElement = consumeValue({ buffer, pointerStart, offset: offset + length, type: castType.valueType });
                length += valueElement.length;
                readValue.set(keyElement.value, valueElement.value);
            }
            break;
        }
        case t.EnumType: {
            length = 1;
            assert_1.default(buffer.byteLength > offset, NOT_LONG_ENOUGH);
            const valueIndex = new Uint8Array(buffer)[offset];
            const { values } = readType;
            assert_1.default.between(0, valueIndex, values.length, 'Index ' + String(valueIndex) + ' is invalid');
            readValue = values[valueIndex];
            break;
        }
        case t.ChoiceType: {
            length = 1;
            assert_1.default(buffer.byteLength > offset, NOT_LONG_ENOUGH);
            const typeIndex = new Uint8Array(buffer)[offset];
            const subValue = consumeValue({
                buffer,
                pointerStart,
                offset: offset + length,
                type: readType.types[typeIndex]
            });
            length += subValue.length;
            readValue = subValue.value;
            break;
        }
        case t.NamedChoiceType: {
            length = 1;
            assert_1.default(buffer.byteLength > offset, NOT_LONG_ENOUGH);
            const typeIndex = new Uint8Array(buffer)[offset];
            const castType = readType;
            const typeConstructor = castType.indexConstructors.get(typeIndex);
            if (typeConstructor === undefined)
                throw new Error('Constructor index ' + String(typeIndex) + ' is invalid');
            const constructor = constructorRegistry.get(typeConstructor.name);
            const subValue = consumeValue({
                buffer,
                pointerStart,
                offset: offset + length,
                type: castType.constructorTypes[typeIndex].type,
                baseValue: new constructor
            });
            length += subValue.length;
            readValue = subValue.value;
            break;
        }
        case t.RecursiveType: {
            let explicitValue;
            ({ value: explicitValue, length } = readBooleanByte(buffer, offset));
            if (explicitValue) {
                const subType = readType.type;
                readValue = makeBaseValue(subType);
                let bufferReadRecursives = readRecursives.get(buffer);
                if (!bufferReadRecursives) {
                    bufferReadRecursives = new Map;
                    readRecursives.set(buffer, bufferReadRecursives);
                }
                bufferReadRecursives.set(offset + length, readValue);
                length += consumeValue({ buffer, pointerStart, offset: offset + length, type: subType, baseValue: readValue }).length;
            }
            else {
                const indexOffset = readFlexInt(buffer, offset + length);
                const target = offset + length - indexOffset.value;
                readValue = readRecursives.get(buffer).get(target);
                assert_1.default(readValue, 'Cannot find target at ' + String(target));
                length += indexOffset.length;
            }
            break;
        }
        case t.OptionalType: {
            let nonNull;
            ({ value: nonNull, length } = readBooleanByte(buffer, offset));
            if (nonNull) {
                const subValue = consumeValue({
                    buffer,
                    pointerStart,
                    offset: offset + length,
                    type: readType.type
                });
                length += subValue.length;
                readValue = subValue.value;
            }
            else
                readValue = null;
            break;
        }
        case t.PointerType: {
            length = 4;
            assert_1.default(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
            let bufferPointerReads = pointerReads.get(buffer);
            if (!bufferPointerReads) {
                bufferPointerReads = new Map;
                pointerReads.set(buffer, bufferPointerReads);
            }
            const castType = readType;
            let bufferTypePointerReads = bufferPointerReads.get(castType);
            if (!bufferTypePointerReads) {
                bufferTypePointerReads = new Map;
                bufferPointerReads.set(castType, bufferTypePointerReads);
            }
            const location = new DataView(buffer).getUint32(offset);
            if (bufferTypePointerReads.has(location))
                readValue = bufferTypePointerReads.get(location);
            else {
                readValue = consumeValue({
                    buffer,
                    pointerStart,
                    offset: pointerStart + location,
                    type: castType.type
                }).value;
                bufferTypePointerReads.set(location, readValue);
            }
            break;
        }
        default:
            throw new Error('Not a structure type: ' + util_inspect_1.inspect(readType));
    }
    return { value: readValue, length };
}
//Number of random characters in synthetic recursive type names
const RECURSIVE_NAME_LENGTH = 16;
//Map of type buffers to maps of ids to synthetic recursive type names
const recursiveNames = new WeakMap();
//Reads a type from the specified bytes at the specified offset
//Returns the type that was read and the number of bytes consumed
function consumeType(typeBuffer, offset) {
    assert_1.default(offset >= 0, 'Offset is negative: ' + String(offset));
    const castBuffer = new Uint8Array(typeBuffer);
    assert_1.default(typeBuffer.byteLength > offset, NOT_LONG_ENOUGH); //make sure there is a type byte
    const typeByte = castBuffer[offset];
    let readType, length = 1; //going to be at least one type byte
    const singleByteType = SINGLE_BYTE_TYPE_BYTES.get(typeByte);
    if (singleByteType)
        return { value: new singleByteType, length };
    switch (typeByte) {
        case t.BooleanTupleType._value: {
            assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
            const tupleLength = castBuffer[offset + length];
            length++;
            readType = new t.BooleanTupleType(tupleLength);
            break;
        }
        case t.TupleType._value: {
            const elementType = consumeType(typeBuffer, offset + length);
            length += elementType.length;
            assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
            const tupleLength = castBuffer[offset + length];
            length++;
            readType = new t.TupleType({
                type: elementType.value,
                length: tupleLength
            });
            break;
        }
        case t.StructType._value: {
            assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
            const fieldCount = castBuffer[offset + length];
            length++;
            const fields = {};
            for (let i = 0; i < fieldCount; i++) {
                assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
                const nameLength = castBuffer[offset + length];
                length++;
                const nameStart = offset + length;
                const nameEnd = nameStart + nameLength;
                assert_1.default(typeBuffer.byteLength >= nameEnd, NOT_LONG_ENOUGH);
                const name = bufferString.toString(castBuffer.subarray(nameStart, nameEnd)); //using castBuffer to be able to subarray it without copying
                length += nameLength;
                const fieldType = consumeType(typeBuffer, nameEnd);
                fields[name] = fieldType.value;
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
            length += valueType.length;
            assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
            const valueCount = castBuffer[offset + length];
            length++;
            const values = new Array(valueCount);
            for (let i = 0; i < valueCount; i++) {
                const valueLocation = offset + length;
                const enumValue = consumeValue({
                    buffer: typeBuffer,
                    pointerStart: valueLocation,
                    offset: valueLocation,
                    type: valueType.value
                });
                length += enumValue.length;
                values[i] = enumValue.value;
            }
            readType = new t.EnumType({
                type: valueType.value,
                values
            });
            break;
        }
        case t.ChoiceType._value: {
            assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
            const typeCount = castBuffer[offset + length];
            length++;
            const types = new Array(typeCount);
            for (let i = 0; i < typeCount; i++) {
                const possibleType = consumeType(typeBuffer, offset + length);
                types[i] = possibleType.value;
                length += possibleType.length;
            }
            readType = new t.ChoiceType(types);
            break;
        }
        case t.NamedChoiceType._value: {
            assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
            const typeCount = castBuffer[offset + length];
            length++;
            const constructorTypes = new Map();
            for (let i = 0; i < typeCount; i++) {
                assert_1.default(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
                const nameLength = castBuffer[offset + length];
                length++;
                const nameStart = offset + length;
                const nameEnd = nameStart + nameLength;
                assert_1.default(typeBuffer.byteLength >= nameEnd, NOT_LONG_ENOUGH);
                const name = bufferString.toString(castBuffer.subarray(nameStart, nameEnd)); //using castBuffer to be able to subarray it without copying
                length += nameLength;
                const possibleType = consumeType(typeBuffer, nameEnd);
                if (!(possibleType.value instanceof t.StructType))
                    throw new Error('Not a StructType: ' + util_inspect_1.inspect(possibleType.value));
                constructorTypes.set(constructorRegistry.get(name), possibleType.value);
                length += possibleType.length;
            }
            readType = new t.NamedChoiceType(constructorTypes);
            break;
        }
        case t.RecursiveType._value: {
            const idInt = readFlexInt(typeBuffer, offset + length);
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
            if (recursiveName === undefined) {
                do {
                    recursiveName = 'read-type';
                    for (let charCount = 0; charCount < RECURSIVE_NAME_LENGTH; charCount++) {
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
            const locationOffset = readFlexInt(typeBuffer, offset + length);
            readType = consumeType(typeBuffer, offset + length - locationOffset.value).value;
            length += locationOffset.length;
            break;
        }
        default:
            throw new Error('No such type: 0x' + pad(castBuffer[offset].toString(16), 2));
    }
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
    assert_1.default.instanceOf(typeBuffer, ArrayBuffer);
    const { value: readValue, length } = consumeType(typeBuffer, 0);
    if (fullBuffer)
        assert_1.default(length === typeBuffer.byteLength, 'Did not consume all of the buffer');
    return readValue;
}
exports.type = type;
/**
 * Deserializes a value, i.e. takes
 * the type that serialized it and a buffer
 * containing its binary form and returns the value.
 * Requires the type to be known.
 *
 * Example:
 * ````javascript
 * let type = new sb.ArrayType(
 *   new sb.FlexUnsignedIntType
 * )
 * let value = [0, 10, 100, 1000, 10000]
 * let buffer = type.valueBuffer(value)
 * let readValue = sb.r.value({type, buffer})
 * console.log(readValue) // [ 0, 10, 100, 1000, 10000 ]
 * ````
 *
 * @param E The type of value to be read
 * @return The value that was read
 */
function value(params) {
    const { buffer, type: readType, offset = 0 } = params;
    assert_1.default.instanceOf(buffer, ArrayBuffer);
    assert_1.default.instanceOf(readType, abstract_1.default);
    assert_1.default.instanceOf(offset, Number);
    const readValue = consumeValue({
        buffer,
        offset,
        type: readType,
        pointerStart: offset
    }).value;
    //no length validation because bytes being pointed to don't get counted in the length
    return readValue;
}
exports.value = value;
