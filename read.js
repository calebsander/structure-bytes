//For use with browserify
if (__dirname === '/') __dirname = '';

const assert = require(__dirname + '/lib/assert.js');
const bitMath = require(__dirname + '/lib/bit-math.js');
const strint = require(__dirname + '/lib/strint.js');
const t = require(__dirname + '/structure-types.js');
const util = require('util');

const NOT_LONG_ENOUGH = 'Buffer is not long enough';
function readLengthBuffer(buffer, offset) {
	try { return {value: buffer.readUInt32BE(offset), length: 4} } //eslint-disable-line semi
	catch (e) { throw new Error(NOT_LONG_ENOUGH) } //eslint-disable-line semi
}
function consumeType(typeBuffer, offset) {
	assert.assert(offset >= 0, 'Offset is negative: ' + String(offset));
	assert.assert(typeBuffer.length > offset, NOT_LONG_ENOUGH);
	let value, length = 1;
	switch (typeBuffer.readUInt8(offset)) {
		case t.ByteType._value:
			value = new t.ByteType;
			break;
		case t.ShortType._value:
			value = new t.ShortType;
			break;
		case t.IntType._value:
			value = new t.IntType;
			break;
		case t.LongType._value:
			value = new t.LongType;
			break;
		case t.UnsignedByteType._value:
			value = new t.UnsignedByteType;
			break;
		case t.UnsignedShortType._value:
			value = new t.UnsignedShortType;
			break;
		case t.UnsignedIntType._value:
			value = new t.UnsignedIntType;
			break;
		case t.UnsignedLongType._value:
			value = new t.UnsignedLongType;
			break;
		case t.DateType._value:
			value = new t.DateType;
			break;
		case t.FloatType._value:
			value = new t.FloatType;
			break;
		case t.DoubleType._value:
			value = new t.DoubleType;
			break;
		case t.BooleanType._value:
			value = new t.BooleanType;
			break;
		case t.BooleanTupleType._value:
			const booleanTupleLength = readLengthBuffer(typeBuffer, offset + length);
			value = new t.BooleanTupleType(booleanTupleLength.value);
			length += booleanTupleLength.length;
			break;
		case t.BooleanArrayType._value:
			value = new t.BooleanArrayType;
			break;
		case t.CharType._value:
			value = new t.CharType;
			break;
		case t.StringType._value:
			value = new t.StringType;
			break;
		case t.OctetsType._value:
			value = new t.OctetsType;
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
			assert.assert(typeBuffer.length > offset + length, NOT_LONG_ENOUGH);
			const fieldCount = typeBuffer.readUInt8(offset + length);
			length++;
			const fields = {};
			for (let i = 0; i < fieldCount; i++) {
				assert.assert(typeBuffer.length > offset + length, NOT_LONG_ENOUGH);
				const nameLength = typeBuffer.readUInt8(offset + length);
				length++;
				assert.assert(typeBuffer.length >= offset + length + nameLength);
				const name = typeBuffer.toString('utf8', offset + length, offset + length + nameLength);
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
			assert.assert(typeBuffer.length > offset + length, NOT_LONG_ENOUGH);
			const valueCount = typeBuffer.readUInt8(offset + length);
			length++;
			const values = [];
			for (let i = 0; i < valueCount; i++) {
				const value = consumeValue({buffer: typeBuffer, offset: offset + length, type: enumType.value});
				length += value.length;
				values[i] = (value.value);
			}
			value = new t.EnumType({
				type: enumType.value,
				values: values
			});
			break;
		case t.ChoiceType._value:
			assert.assert(typeBuffer.length > offset + length, NOT_LONG_ENOUGH);
			const typeCount = typeBuffer.readUInt8(offset + length);
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
			assert.assert(typeBuffer.length >= offset + newLength, NOT_LONG_ENOUGH);
			({value} = consumeType(typeBuffer, offset + length - typeBuffer.readUInt16BE(offset + length)));
			length = newLength;
			break;
		default:
			assert.fail('No such type: 0x' + typeBuffer[offset].toString(16));
	}
	return {value, length};
}
function type(typeBuffer, fullBuffer = true) {
	assert.instanceOf(typeBuffer, Buffer);
	const {value, length} = consumeType(typeBuffer, 0);
	if (fullBuffer) assert.assert(length === typeBuffer.length, 'Did not consume all of the buffer');
	return value;
}
function readBooleans({buffer, offset, count}) {
	const value = new Array(count);
	const incompleteBytes = bitMath.modEight(value.length);
	const bytes = bitMath.dividedByEight(value.length);
	let byteLength;
	if (incompleteBytes) byteLength = bytes + 1;
	else byteLength = bytes;
	assert.assert(buffer.length >= offset + byteLength, NOT_LONG_ENOUGH);
	for (let i = 0; i < byteLength; i++) {
		const byte = buffer.readUInt8(offset + i);
		for (let bit = 0; bit < 8; bit++) {
			const index = i * 8 + bit;
			if (index === value.length) break;
			value[index] = !!(byte & (1 << bitMath.modEight(~bitMath.modEight(bit))));
		}
	}
	return {value, length: byteLength};
}
function consumeValue({buffer, offset, type}) {
	let value, length;
	switch (type.constructor) {
		case t.ByteType:
			length = 1;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			value = buffer.readInt8(offset);
			break;
		case t.ShortType:
			length = 2;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			value = buffer.readInt16BE(offset);
			break;
		case t.IntType:
			length = 4;
			value = buffer.readInt32BE(offset);
			break;
		case t.LongType:
			length = 8;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			const upper = buffer.readInt32BE(offset);
			const lower = buffer.readUInt32BE(offset + 4);
			value = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower));
			break;
		case t.UnsignedByteType:
			length = 1;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			value = buffer.readUInt8(offset);
			break;
		case t.UnsignedShortType:
			length = 2;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			value = buffer.readUInt16BE(offset);
			break;
		case t.UnsignedIntType:
			length = 4;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			value = buffer.readUInt32BE(offset);
			break;
		case t.UnsignedLongType:
		case t.DateType:
			length = 8;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			const unsignedUpper = buffer.readUInt32BE(offset);
			const unsignedLower = buffer.readUInt32BE(offset + 4);
			value = strint.add(strint.mul(String(unsignedUpper), strint.LONG_UPPER_SHIFT), String(unsignedLower));
			if (type.constructor === t.DateType) value = new Date(Number(value));
			break;
		case t.FloatType:
			length = 4;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			value = buffer.readFloatBE(offset);
			break;
		case t.DoubleType:
			length = 8;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			value = buffer.readDoubleBE(offset);
			break;
		case t.BooleanType:
			length = 1;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			const readByte = buffer.readUInt8(offset);
			assert.assert((readByte === 0x00 || readByte === 0xFF), '0x' + readByte.toString(16) + ' is an invalid Boolean value');
			value = !!readByte;
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
			assert.assert(buffer.length > offset, NOT_LONG_ENOUGH);
			value = buffer.slice(offset, offset + 4).toString()[0]; //UTF-8 codepoint can't be more than 4 bytes
			length = Buffer.byteLength(value);
			break;
		case t.StringType:
			length = 0;
			for (;;) {
				assert.assert(buffer.length > offset + length, NOT_LONG_ENOUGH);
				if (!buffer.readUInt8(offset + length)) break;
				length++;
			}
			value = buffer.slice(offset, offset + length).toString();
			length++; //account for null byte
			break;
		case t.OctetsType:
			const octetsLength = readLengthBuffer(buffer, offset);
			length = octetsLength.length;
			const finalLength = length + octetsLength.value;
			assert.assert(buffer.length >= offset + finalLength, NOT_LONG_ENOUGH);
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
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			const valueIndex = buffer.readUInt8(offset);
			value = type.values[valueIndex];
			if (value === undefined) assert.fail('Index ' + String(valueIndex) + ' is invalid');
			break;
		case t.ChoiceType:
			length = 1;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			const typeIndex = buffer.readUInt8(offset);
			const subValue = consumeValue({buffer, offset: offset + length, type: type.types[typeIndex]});
			length += subValue.length;
			value = subValue.value;
			break;
		case t.OptionalType:
			length = 1;
			assert.assert(buffer.length >= offset + length, NOT_LONG_ENOUGH);
			const optionalByte = buffer.readUInt8(offset);
			assert.assert((optionalByte === 0x00 || optionalByte === 0xFF), '0x' + optionalByte.toString(16) + ' is an invalid Optional byte');
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
function value({buffer, type, offset = 0}) {
	assert.instanceOf(buffer, Buffer);
	assert.instanceOf(type, t.Type);
	const {value} = consumeValue({buffer, offset: offset, type});
	return value;
}

module.exports = {
	_consumeType: consumeType,
	type,
	value
};