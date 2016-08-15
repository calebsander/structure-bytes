//For use with browserify
if (__dirname === '/') __dirname = '';

//This file contains functions for reading types and values from bytes

const assert = require(__dirname + '/lib/assert.js');
const bitMath = require(__dirname + '/lib/bit-math.js');
const bufferString = require(__dirname + '/lib/buffer-string.js');
const strint = require(__dirname + '/lib/strint.js');
const t = require(__dirname + '/structure-types.js');
const util = require('util');

const NOT_LONG_ENOUGH = 'Buffer is not long enough';
//Reads a 4-byte length buffer
function readLengthBuffer(buffer, offset) {
	try {
		return {
			value: new DataView(buffer).getUint32(offset),
			length: 4
		};
	}
	catch (e) { assert.fail(NOT_LONG_ENOUGH) } //eslint-disable-line semi
}
const SINGLE_BYTE_TYPES = [ //types whose type bytes are only 1 byte long (the type byte)
	t.ByteType,
	t.ShortType,
	t.IntType,
	t.LongType,
	t.BigIntType,
	t.UnsignedByteType,
	t.UnsignedShortType,
	t.UnsignedIntType,
	t.UnsignedLongType,
	t.DateType,
	t.BigUnsignedIntType,
	t.FloatType,
	t.DoubleType,
	t.BooleanType,
	t.BooleanArrayType,
	t.CharType,
	t.StringType,
	t.OctetsType
];
//Pads a string with preceding 0s so that it has the desired length (for error messages)
function pad(str, digits) {
	if (str.length < digits) return '0'.repeat(digits - str.length) + str;
	else return str;
}
//Reads a type from the specified bytes at the specified offset
//Returns the type that was read and the number of bytes consumed
function consumeType(typeBuffer, offset) {
	assert.assert(offset >= 0, 'Offset is negative: ' + String(offset));
	assert.assert(typeBuffer.byteLength > offset, NOT_LONG_ENOUGH); //make sure there is a type byte
	let value, length = 1;
	const typeByte = new Uint8Array(typeBuffer)[offset];
	for (let testType of SINGLE_BYTE_TYPES) {
		if (typeByte === testType._value) return {value: new testType, length}; //eslint-disable-line new-cap
	}
	switch (typeByte) {
		case t.BooleanTupleType._value:
			const booleanTupleLength = readLengthBuffer(typeBuffer, offset + length);
			value = new t.BooleanTupleType(booleanTupleLength.value);
			length += booleanTupleLength.length;
			break;
		case t.TupleType._value:
			const tupleType = consumeType(typeBuffer, offset + length);
			length += tupleType.length;
			const tupleLength = readLengthBuffer(typeBuffer, offset + length);
			length += tupleLength.length;
			value = new t.TupleType({
				type: tupleType.value,
				length: tupleLength.value
			});
			break;
		case t.StructType._value:
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
			const castBuffer = new Uint8Array(typeBuffer);
			const fieldCount = castBuffer[offset + length];
			length++;
			const fields = {};
			for (let i = 0; i < fieldCount; i++) { //read field information for each field
				assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
				const nameLength = castBuffer[offset + length];
				length++;
				assert.assert(typeBuffer.byteLength >= offset + length + nameLength, NOT_LONG_ENOUGH);
				const name = bufferString.toString(castBuffer.subarray(offset + length, offset + length + nameLength));
				length += nameLength;
				const fieldType = consumeType(typeBuffer, offset + length);
				fields[name] = fieldType.value;
				length += fieldType.length;
			}
			value = new t.StructType(fields);
			break;
		case t.ArrayType._value:
			const arrayType = consumeType(typeBuffer, offset + length);
			length += arrayType.length;
			value = new t.ArrayType(arrayType.value);
			break;
		case t.SetType._value:
			const setType = consumeType(typeBuffer, offset + length);
			length += setType.length;
			value = new t.SetType(setType.value);
			break;
		case t.MapType._value:
			const keyType = consumeType(typeBuffer, offset + length);
			length += keyType.length;
			const valueType = consumeType(typeBuffer, offset + length);
			length += valueType.length;
			value = new t.MapType(keyType.value, valueType.value);
			break;
		case t.EnumType._value:
			const enumType = consumeType(typeBuffer, offset + length);
			length += enumType.length;
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
			const valueCount = new Uint8Array(typeBuffer)[offset + length];
			length++;
			const values = [];
			for (let i = 0; i < valueCount; i++) {
				const value = consumeValue({buffer: typeBuffer, offset: offset + length, type: enumType.value}); //reading values rather than types
				length += value.length;
				values[i] = value.value;
			}
			value = new t.EnumType({
				type: enumType.value,
				values: values
			});
			break;
		case t.ChoiceType._value:
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH);
			const typeCount = new Uint8Array(typeBuffer)[offset + length];
			length++;
			const types = new Array(typeCount);
			for (let i = 0; i < typeCount; i++) {
				const type = consumeType(typeBuffer, offset + length);
				types[i] = type.value;
				length += type.length;
			}
			value = new t.ChoiceType(types);
			break;
		case t.OptionalType._value:
			const optionalType = consumeType(typeBuffer, offset + length);
			length += optionalType.length;
			value = new t.OptionalType(optionalType.value);
			break;
		case t.PointerType._value:
			const pointerType = consumeType(typeBuffer, offset + length);
			length += pointerType.length;
			value = new t.PointerType(pointerType.value);
			break;
		case t.REPEATED_TYPE:
			const newLength = length + 2;
			assert.assert(typeBuffer.byteLength >= offset + newLength, NOT_LONG_ENOUGH);
			const locationOffset = new DataView(typeBuffer).getUint16(offset + length);
			({value} = consumeType(typeBuffer, offset + length - locationOffset));
			length = newLength;
			break;
		default:
			assert.fail('No such type: 0x' + pad(new Uint8Array(typeBuffer)[offset].toString(16), 2));
	}
	return {value, length};
}
function type(typeBuffer, fullBuffer = true) {
	assert.instanceOf(typeBuffer, ArrayBuffer);
	const {value, length} = consumeType(typeBuffer, 0);
	if (fullBuffer) assert.assert(length === typeBuffer.byteLength, 'Did not consume all of the buffer');
	return value;
}
function readBooleans({buffer, offset, count}) { //complement to writeBooleans() in structure-types.js
	const value = new Array(count);
	const incompleteBytes = bitMath.modEight(value.length);
	const bytes = bitMath.dividedByEight(value.length);
	let byteLength;
	if (incompleteBytes) byteLength = bytes + 1;
	else byteLength = bytes;
	assert.assert(buffer.byteLength >= offset + byteLength, NOT_LONG_ENOUGH);
	const castBuffer = new Uint8Array(buffer);
	for (let i = 0; i < byteLength; i++) {
		const byte = castBuffer[offset + i];
		for (let bit = 0; bit < 8; bit++) {
			const index = i * 8 + bit;
			if (index === value.length) break;
			value[index] = !!(byte & (1 << bitMath.modEight(~bitMath.modEight(bit))));
		}
	}
	return {value, length: byteLength};
}
//Reads a value from the specified bytes at the specified offset, given a type
//Returns the value that was read and the number of bytes consumed (excepting any values being pointed to)
function consumeValue({buffer, offset, type}) {
	let value, length;
	switch (type.constructor) {
		case t.ByteType:
			length = 1;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			value = new Int8Array(buffer)[offset]; //endianness doesn't matter because there is only 1 byte
			break;
		case t.ShortType:
			length = 2;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const shortView = new DataView(buffer);
			value = shortView.getInt16(offset);
			break;
		case t.IntType:
			length = 4;
			const intView = new DataView(buffer);
			value = intView.getInt32(offset);
			break;
		case t.LongType:
			length = 8;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const longView = new DataView(buffer);
			const upper = longView.getInt32(offset);
			const lower = longView.getUint32(offset + 4);
			value = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower));
			break;
		case t.BigIntType:
			length = 2;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const bigIntView = new DataView(buffer);
			const bigIntBytes = bigIntView.getUint16(offset);
			assert.assert(buffer.byteLength >= offset + length + bigIntBytes, NOT_LONG_ENOUGH);
			if (bigIntBytes) value = String(bigIntView.getInt8(offset + length));
			else value = '0';
			for (let byte = 1; byte < bigIntBytes; byte++) {
				if (byte) value = strint.mul(value, strint.BYTE_SHIFT); //after the first byte, shift everything left one byte before adding
				value = strint.add(value, String(bigIntView.getUint8(offset + length + byte)));
			}
			length += bigIntBytes;
			break;
		case t.UnsignedByteType:
			length = 1;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			value = new Uint8Array(buffer)[offset]; //endianness doesn't matter because there is only 1 byte
			break;
		case t.UnsignedShortType:
			length = 2;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			value = new DataView(buffer).getUint16(offset);
			break;
		case t.UnsignedIntType:
			length = 4;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			value = new DataView(buffer).getUint32(offset);
			break;
		case t.UnsignedLongType:
		case t.DateType:
			length = 8;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const unsignedLongView = new DataView(buffer);
			const unsignedUpper = unsignedLongView.getUint32(offset);
			const unsignedLower = unsignedLongView.getUint32(offset + 4);
			value = strint.add(strint.mul(String(unsignedUpper), strint.LONG_UPPER_SHIFT), String(unsignedLower));
			if (type.constructor === t.DateType) value = new Date(Number(value));
			break;
		case t.BigUnsignedIntType:
			length = 2;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const bigUnsignedView = new DataView(buffer);
			const bigUnsignedBytes = bigUnsignedView.getUint16(offset);
			assert.assert(buffer.byteLength >= offset + length + bigUnsignedBytes, NOT_LONG_ENOUGH);
			value = '0';
			for (let byte = 0; byte < bigUnsignedBytes; byte++) {
				if (byte) value = strint.mul(value, strint.BYTE_SHIFT); //after the first byte, shift everything left one byte before adding
				value = strint.add(value, String(bigUnsignedView.getUint8(offset + length + byte)));
			}
			length += bigUnsignedBytes;
			break;
		case t.FloatType:
			length = 4;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			value = new DataView(buffer).getFloat32(offset);
			break;
		case t.DoubleType:
			length = 8;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			value = new DataView(buffer).getFloat64(offset);
			break;
		case t.BooleanType:
			length = 1;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const readByte = new Uint8Array(buffer)[offset];
			assert.assert((readByte === 0x00 || readByte === 0xFF), '0x' + readByte.toString(16) + ' is an invalid Boolean value');
			value = !!readByte; //convert integer to boolean
			break;
		case t.BooleanArrayType:
			const booleanArrayLength = readLengthBuffer(buffer, offset);
			length = booleanArrayLength.length;
			const booleanArray = readBooleans({buffer, offset: offset + length, count: booleanArrayLength.value});
			length += booleanArray.length;
			({value} = booleanArray);
			break;
		case t.BooleanTupleType:
			({value, length} = readBooleans({buffer, offset, count: type.length}));
			break;
		case t.CharType:
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH);
			value = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + 4))[0]; //UTF-8 codepoint can't be more than 4 bytes
			length = bufferString.fromString(value).byteLength;
			break;
		case t.StringType:
			const castBuffer = new Uint8Array(buffer);
			for (length = 0; ; length++) {
				assert.assert(buffer.byteLength > offset + length, NOT_LONG_ENOUGH);
				if (!castBuffer[offset + length]) break;
			}
			value = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + length));
			length++; //account for null byte
			break;
		case t.OctetsType:
			const octetsLength = readLengthBuffer(buffer, offset);
			({length} = octetsLength);
			const finalLength = length + octetsLength.value;
			assert.assert(buffer.byteLength >= offset + finalLength, NOT_LONG_ENOUGH);
			value = buffer.slice(offset + length, offset + finalLength);
			length = finalLength;
			break;
		case t.TupleType:
			length = 0;
			value = new Array(type.length);
			for (let i = 0; i < type.length; i++) {
				const tupleElement = consumeValue({buffer, offset: offset + length, type: type.type});
				length += tupleElement.length;
				value[i] = tupleElement.value;
			}
			break;
		case t.StructType:
			length = 0;
			value = {};
			for (let field of type.fields) {
				const fieldName = field.name;
				const fieldType = field.type;
				const readField = consumeValue({buffer, offset: offset + length, type: fieldType});
				value[fieldName] = readField.value;
				length += readField.length;
			}
			break;
		case t.ArrayType:
			const arrayLength = readLengthBuffer(buffer, offset);
			length = arrayLength.length;
			value = new Array(arrayLength.value);
			for (let i = 0; i < value.length; i++) {
				const arrayElement = consumeValue({buffer, offset: offset + length, type: type.type});
				length += arrayElement.length;
				value[i] = arrayElement.value;
			}
			break;
		case t.SetType:
			const setLength = readLengthBuffer(buffer, offset);
			length = setLength.length;
			value = new Set;
			for (let i = 0; i < setLength.value; i++) {
				const setElement = consumeValue({buffer, offset: offset + length, type: type.type});
				length += setElement.length;
				value.add(setElement.value);
			}
			break;
		case t.MapType:
			const mapSize = readLengthBuffer(buffer, offset);
			length = mapSize.length;
			value = new Map;
			for (let i = 0; i < mapSize.value; i++) {
				const keyElement = consumeValue({buffer, offset: offset + length, type: type.keyType});
				length += keyElement.length;
				const valueElement = consumeValue({buffer, offset: offset + length, type: type.valueType});
				length += valueElement.length;
				value.set(keyElement.value, valueElement.value);
			}
			break;
		case t.EnumType:
			length = 1;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const valueIndex = new Uint8Array(buffer)[offset];
			value = type.values[valueIndex];
			if (value === undefined) assert.fail('Index ' + String(valueIndex) + ' is invalid');
			break;
		case t.ChoiceType:
			length = 1;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const typeIndex = new Uint8Array(buffer)[offset];
			const subValue = consumeValue({buffer, offset: offset + length, type: type.types[typeIndex]});
			length += subValue.length;
			value = subValue.value;
			break;
		case t.OptionalType:
			length = 1;
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH);
			const optionalByte = new Uint8Array(buffer)[offset];
			assert.assert(optionalByte === 0x00 || optionalByte === 0xFF, '0x' + optionalByte.toString(16) + ' is an invalid Optional byte');
			if (optionalByte) {
				const subValue = consumeValue({buffer, offset: offset + length, type: type.type});
				length += subValue.length;
				value = subValue.value;
			}
			else value = null;
			break;
		case t.PointerType:
			const location = readLengthBuffer(buffer, offset);
			length = location.length;
			value = consumeValue({buffer, offset: location.value, type: type.type}).value;
			break;
		default:
			assert.fail('Not a structure type: ' + util.inspect(type));
	}
	return {value, length};
}
function value({buffer, type, offset}) {
	assert.instanceOf(buffer, ArrayBuffer);
	assert.instanceOf(type, t.Type);
	if (offset === undefined) offset = 0; //for some reason, isparta doesn't like default parameters inside destructuring
	assert.instanceOf(offset, Number);
	const {value} = consumeValue({buffer, offset, type});
	//no length validation because bytes being pointed to don't get counted in the length
	return value;
}

/** @namespace
 * @alias r
 */
module.exports = {
	/** @function
	 * @private
	 */
	_consumeType: consumeType,
	/** @function
	 * @desc Reads a type from its written buffer
	 * @param {external:Buffer} typeBuffer
	 * The buffer containing the type bytes
	 * @param {boolean} [fullBuffer=true] Whether to assert that
	 * the whole buffer was read. In most use cases, should be omitted.
	 * @return {Type} The type that was read
	 */
	type,
	/** @function
	 * @desc Reads a value from its written buffer.
	 * Requires the type to be known.
	 * @param {{buffer, type, offset}} params
	 * @param {external:Buffer} params.buffer
	 * The buffer containing the value bytes
	 * @param {Type} params.type
	 * The type that was used to write the value bytes
	 * @param {number} [params.offset=0]
	 * The offset in the buffer to start reading at
	 * @return The value that was read
	 */
	value
};