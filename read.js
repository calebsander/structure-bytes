const assert = require(__dirname + '/lib/assert.js');
const t = require(__dirname + '/structure-types.js');

const NOT_LONG_ENOUGH = 'Buffer is not long enough';
function readLengthBuffer(typeBuffer, offset) {
	try { return {value: typeBuffer.readUInt32BE(offset), length: 4} }
	catch (e) { throw new Error(NOT_LONG_ENOUGH) }
}
function consumeType(typeBuffer, offset) {
	assert.assert(typeBuffer.length > offset, NOT_LONG_ENOUGH);
	let value, length = 1;
	switch (typeBuffer.readUInt8(offset)) {
		case t.ByteType._value:
			value = new t.ByteType();
			break;
		case t.ShortType._value:
			value = new t.ShortType();
			break;
		case t.IntType._value:
			value = new t.IntType();
			break;
		case t.LongType._value:
			value = new t.LongType();
			break;
		case t.UnsignedByteType._value:
			value = new t.UnsignedByteType();
			break;
		case t.UnsignedShortType._value:
			value = new t.UnsignedShortType();
			break;
		case t.UnsignedIntType._value:
			value = new t.UnsignedIntType();
			break;
		case t.UnsignedLongType._value:
			value = new t.UnsignedLongType();
			break;
		case t.FloatType._value:
			value = new t.FloatType();
			break;
		case t.DoubleType._value:
			value = new t.DoubleType();
			break;
		case t.BooleanType._value:
			value = new t.BooleanType();
			break;
		case t.BooleanTupleType._value:
			const booleanTupleLength = readLengthBuffer(typeBuffer, offset + length);
			value = new t.BooleanTupleType(booleanTupleLength.value);
			length += booleanTupleLength.length;
			break;
		case t.BooleanArrayType._value:
			value = new t.BooleanArrayType();
			break;
		case t.CharType._value:
			value = new t.CharType();
			break;
		case t.StringType._value:
			value = new t.StringType();
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
				const value = consumeValue({valueBuffer: typeBuffer, offset: offset + length, type: enumType.value});
				length += value.length;
				values[i] = (value.value);
			}
			value = new t.EnumType({
				type: enumType.value,
				values: values
			});
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
		default:
			assert.fail('No such type: 0x' + typeBuffer[offset].toString(16))
	}
	return {value, length};
}
function readType(typeBuffer, fullBuffer = true) {
	assert.instanceOf(typeBuffer, Buffer);
	const {value, length} = consumeType(typeBuffer, 0);
	if (fullBuffer) assert.assert(length === typeBuffer.length, 'Did not consume all of the buffer');
	return value;
}
function consumeValue({valueBuffer, offset, type}) {
	let value, length = 0;
	switch (type.constructor) {
		case t.CharType:
			value = valueBuffer.slice(offset, offset + 4).toString()[0]; //UTF-8 codepoint can't be more than 4 bytes
			length += Buffer.byteLength(value);
			break;
		case t.StringType:
			while (true) {
				assert.assert(valueBuffer.length > offset + length, NOT_LONG_ENOUGH);
				if (!valueBuffer.readUInt8(offset + length)) break;
				length++;
			}
			value = valueBuffer.slice(offset, offset + length).toString();
			length++;
			break;
		default:
			assert.fail('Not a type: ' + util.inspect(type));
	}
	return {value, length};
}
function readValue({valueBuffer, type, offset = 0, fullBuffer = true}) {
	assert.instanceOf(valueBuffer, Buffer);
	const {value, length} = consumeValue({valueBuffer, offset: offset, type});
	if (fullBuffer) assert.assert(length === valueBuffer.length, 'Did not consume all of the buffer');
	return value;
}

module.exports = {
	readType,
	readValue
};