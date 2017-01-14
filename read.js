//For use with browserify
if (__dirname === '/') __dirname = ''

//This file contains functions for reading types and values from bytes

const assert = require(__dirname + '/lib/assert.js')
const bitMath = require(__dirname + '/lib/bit-math.js')
const bufferString = require(__dirname + '/lib/buffer-string.js')
const constructorRegistry = require(__dirname + '/constructor-registry.js')
const flexInt = require(__dirname + '/lib/flex-int.js')
const recursiveRegistry = require(__dirname + '/recursive-registry.js')
const strint = require(__dirname + '/lib/strint.js')
const t = require(__dirname + '/structure-types.js')
const util = require('util')

const NOT_LONG_ENOUGH = 'Buffer is not long enough'
//Reads a 4-byte length buffer
function readLengthBuffer(buffer, offset) {
	try {
		return {
			value: new DataView(buffer).getUint32(offset),
			length: 4
		}
	}
	catch (e) { assert.fail(NOT_LONG_ENOUGH) }
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
])
//Mapping of type bytes to the corresponding types
const SINGLE_BYTE_TYPE_BYTES = new Map
for (const singleByteType of SINGLE_BYTE_TYPES) {
	SINGLE_BYTE_TYPE_BYTES.set(singleByteType._value, singleByteType)
}
//Pads a string with preceding 0s so that it has the desired length (for error messages)
function pad(str, digits) {
	if (str.length < digits) return '0'.repeat(digits - str.length) + str
	else return str
}
//Returns an object to which keys are added when reading an instance of the specified type
//This allows the reference to the read value to be used before it is populated
function makeBaseValue(type, count) {
	switch (type.constructor) {
		case t.ArrayType: {
			return new Array(count)
		}
		case t.TupleType: {
			return new Array(type.length)
		}
		case t.MapType: {
			return new Map
		}
		case t.SetType: {
			return new Set
		}
		case t.StructType: {
			return {}
		}
		/*istanbul ignore next*/
		default: {
			throw new Error('Invalid type for base value: ' + util.inspect(type))
		}
	}
}
//Counterpart for writeBooleans() in structure-types.js
function readBooleans({buffer, offset, count, baseValue}) {
	const value = baseValue || new Array(count)
	const incompleteBytes = bitMath.modEight(value.length)
	const bytes = bitMath.dividedByEight(value.length)
	let byteLength
	if (incompleteBytes) byteLength = bytes + 1
	else byteLength = bytes
	assert.assert(buffer.byteLength >= offset + byteLength, NOT_LONG_ENOUGH)
	const castBuffer = new Uint8Array(buffer)
	for (let i = 0; i < byteLength; i++) {
		const byte = castBuffer[offset + i]
		for (let bit = 0; bit < 8; bit++) {
			const index = i * 8 + bit
			if (index === value.length) break
			value[index] = !!(byte & (1 << bitMath.modEight(~bitMath.modEight(bit))))
		}
	}
	return {value, length: byteLength}
}
/*
	Reads a value from the specified bytes at the specified offset, given a type
	Returns the value that was read and the number of bytes consumed (excepting any values being pointed to)
	Pointer start refers to the position in the buffer where the root value starts
	(pointers will be relative to this location)
*/
//Map of value buffers to maps of indices to read values for recursive types
const readRecursives = new WeakMap
function consumeValue({buffer, pointerStart, offset, type, baseValue}) {
	let value, length
	switch (type.constructor) {
		case t.ByteType: {
			length = 1
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new Int8Array(buffer)[offset] //endianness doesn't matter because there is only 1 byte
			break
		}
		case t.ShortType: {
			length = 2
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			value = dataView.getInt16(offset)
			break
		}
		case t.IntType: {
			length = 4
			const dataView = new DataView(buffer)
			value = dataView.getInt32(offset)
			break
		}
		case t.LongType:
		case t.DateType: {
			length = 8
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const upper = dataView.getInt32(offset)
			const lower = dataView.getUint32(offset + 4)
			value = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower))
			if (type.constructor === t.DateType) value = new Date(Number(value))
			break
		}
		case t.BigIntType: {
			length = 2
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const bytes = dataView.getUint16(offset)
			assert.assert(buffer.byteLength >= offset + length + bytes, NOT_LONG_ENOUGH)
			if (bytes) value = String(dataView.getInt8(offset + length))
			else value = '0'
			for (let byte = 1; byte < bytes; byte++) {
				if (byte) value = strint.mul(value, strint.BYTE_SHIFT) //after the first byte, shift everything left one byte before adding
				value = strint.add(value, String(dataView.getUint8(offset + length + byte)))
			}
			length += bytes
			break
		}
		case t.UnsignedByteType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			value = new Uint8Array(buffer)[offset] //endianness doesn't matter because there is only 1 byte
			break
		}
		case t.UnsignedShortType: {
			length = 2
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getUint16(offset)
			break
		}
		case t.UnsignedIntType: {
			length = 4
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getUint32(offset)
			break
		}
		case t.UnsignedLongType: {
			length = 8
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const upper = dataView.getUint32(offset)
			const lower = dataView.getUint32(offset + 4)
			value = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower))
			break
		}
		case t.BigUnsignedIntType: {
			length = 2
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const bytes = dataView.getUint16(offset)
			assert.assert(buffer.byteLength >= offset + length + bytes, NOT_LONG_ENOUGH)
			value = '0'
			for (let byte = 0; byte < bytes; byte++) {
				if (byte) value = strint.mul(value, strint.BYTE_SHIFT) //after the first byte, shift everything left one byte before adding
				value = strint.add(value, String(dataView.getUint8(offset + length + byte)))
			}
			length += bytes
			break
		}
		case t.FlexUnsignedIntType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const bytes = flexInt.getByteCount(new Uint8Array(buffer)[offset])
			assert.assert(buffer.byteLength >= offset + bytes, NOT_LONG_ENOUGH)
			value = flexInt.readValueBuffer(buffer.slice(offset, offset + bytes))
			length += bytes
			break
		}
		case t.DayType: {
			length = 3
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const day = (dataView.getInt16(offset) << 8) | dataView.getUint8(offset + 2)
			const utcDate = day * t.MILLIS_PER_DAY
			value = new Date(utcDate + new Date(utcDate).getTimezoneOffset() * t.MILLIS_PER_MINUTE)
			break
		}
		case t.TimeType: {
			length = 4
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new Date(new DataView(buffer).getUint32(offset))
			break
		}
		case t.FloatType: {
			length = 4
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getFloat32(offset)
			break
		}
		case t.DoubleType: {
			length = 8
			assert.assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getFloat64(offset)
			break
		}
		case t.BooleanType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const readByte = new Uint8Array(buffer)[offset]
			assert.assert(readByte === 0x00 || readByte === 0xFF, '0x' + readByte.toString(16) + ' is an invalid Boolean value')
			value = !!readByte //convert integer to boolean
			break
		}
		case t.BooleanArrayType: {
			const arrayLength = readLengthBuffer(buffer, offset)
			length = arrayLength.length
			const booleans = readBooleans({buffer, offset: offset + length, count: arrayLength.value, baseValue})
			length += booleans.length
			;({value} = booleans)
			break
		}
		case t.BooleanTupleType: {
			({value, length} = readBooleans({buffer, offset, count: type.length, baseValue}))
			break
		}
		case t.CharType: {
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			value = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + 4))[0] //UTF-8 codepoint can't be more than 4 bytes
			length = bufferString.fromString(value).byteLength
			break
		}
		case t.StringType: {
			const castBuffer = new Uint8Array(buffer)
			for (length = 0; ; length++) {
				assert.assert(buffer.byteLength > offset + length, NOT_LONG_ENOUGH)
				if (!castBuffer[offset + length]) break
			}
			value = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + length))
			length++ //account for null byte
			break
		}
		case t.OctetsType: {
			const octetsLength = readLengthBuffer(buffer, offset)
			;({length} = octetsLength)
			const finalLength = length + octetsLength.value
			assert.assert(buffer.byteLength >= offset + finalLength, NOT_LONG_ENOUGH)
			value = buffer.slice(offset + length, offset + finalLength)
			length = finalLength
			break
		}
		case t.TupleType: {
			length = 0
			value = baseValue || makeBaseValue(type)
			for (let i = 0; i < type.length; i++) {
				const element = consumeValue({buffer, pointerStart, offset: offset + length, type: type.type})
				length += element.length
				value[i] = element.value
			}
			break
		}
		case t.StructType: {
			length = 0
			value = baseValue || makeBaseValue(type)
			for (const field of type.fields) {
				const readField = consumeValue({buffer, pointerStart, offset: offset + length, type: field.type})
				value[field.name] = readField.value
				length += readField.length
			}
			break
		}
		case t.ArrayType: {
			const arrayLength = readLengthBuffer(buffer, offset)
			length = arrayLength.length
			value = baseValue || makeBaseValue(type, arrayLength.value)
			for (let i = 0; i < value.length; i++) {
				const element = consumeValue({buffer, pointerStart, offset: offset + length, type: type.type})
				length += element.length
				value[i] = element.value
			}
			break
		}
		case t.SetType: {
			const size = readLengthBuffer(buffer, offset)
			length = size.length
			value = baseValue || makeBaseValue(type)
			for (let i = 0; i < size.value; i++) {
				const element = consumeValue({buffer, pointerStart, offset: offset + length, type: type.type})
				length += element.length
				value.add(element.value)
			}
			break
		}
		case t.MapType: {
			const size = readLengthBuffer(buffer, offset)
			length = size.length
			value = baseValue || makeBaseValue(type)
			for (let i = 0; i < size.value; i++) {
				const keyElement = consumeValue({buffer, pointerStart, offset: offset + length, type: type.keyType})
				length += keyElement.length
				const valueElement = consumeValue({buffer, pointerStart, offset: offset + length, type: type.valueType})
				length += valueElement.length
				value.set(keyElement.value, valueElement.value)
			}
			break
		}
		case t.EnumType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const valueIndex = new Uint8Array(buffer)[offset]
			value = type.values[valueIndex]
			if (value === undefined) assert.fail('Index ' + String(valueIndex) + ' is invalid')
			break
		}
		case t.ChoiceType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const typeIndex = new Uint8Array(buffer)[offset]
			const subValue = consumeValue({buffer, pointerStart, offset: offset + length, type: type.types[typeIndex]})
			length += subValue.length
			;({value} = subValue)
			break
		}
		case t.NamedChoiceType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const typeIndex = new Uint8Array(buffer)[offset]
			const constructorName = type.indexConstructors.get(typeIndex).name
			const constructor = constructorRegistry.get(constructorName)
			const subValue = consumeValue({
				buffer,
				pointerStart,
				offset: offset + length,
				type: type.constructorTypes[typeIndex].type,
				baseValue: new constructor
			})
			length += subValue.length
			;({value} = subValue)
			break
		}
		case t.RecursiveType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const readValueByte = new Uint8Array(buffer)[offset]
			assert.assert(readValueByte === 0x00 || readValueByte === 0xFF, '0x' + readValueByte.toString(16) + ' is an invalid Recursive byte')
			if (readValueByte) {
				const subType = type.type
				value = makeBaseValue(subType)
				if (!readRecursives.has(buffer)) readRecursives.set(buffer, new Map)
				readRecursives.get(buffer).set(offset + length, value)
				length += consumeValue({buffer, pointerStart, offset: offset + length, type: subType, baseValue: value}).length
			}
			else {
				const indexOffset = readLengthBuffer(buffer, offset + length)
				const target = offset + length - indexOffset.value
				value = readRecursives.get(buffer).get(target)
				assert.assert(value !== undefined, 'Cannot find target at ' + String(target))
				length += indexOffset.length
			}
			break
		}
		case t.OptionalType: {
			length = 1
			assert.assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const optionalByte = new Uint8Array(buffer)[offset]
			assert.assert(optionalByte === 0x00 || optionalByte === 0xFF, '0x' + optionalByte.toString(16) + ' is an invalid Optional byte')
			if (optionalByte) {
				const subValue = consumeValue({buffer, pointerStart, offset: offset + length, type: type.type})
				length += subValue.length
				value = subValue.value
			}
			else value = null
			break
		}
		case t.PointerType: {
			const location = readLengthBuffer(buffer, offset)
			length = location.length
			value = consumeValue({buffer, pointerStart, offset: pointerStart + location.value, type: type.type}).value
			break
		}
		default:
			assert.fail('Not a structure type: ' + util.inspect(type))
	}
	return {value, length}
}
//Number of random characters in synthetic recursive type names
const RECURSIVE_NAME_LENGTH = 16
//Map of type buffers to maps of ids synthetic recursive type names
const recursiveNames = new WeakMap
//Reads a type from the specified bytes at the specified offset
//Returns the type that was read and the number of bytes consumed
function consumeType(typeBuffer, offset) {
	assert.assert(offset >= 0, 'Offset is negative: ' + String(offset))
	const castBuffer = new Uint8Array(typeBuffer)
	assert.assert(typeBuffer.byteLength > offset, NOT_LONG_ENOUGH) //make sure there is a type byte
	const typeByte = castBuffer[offset]
	let value,
		length = 1
	const singleByteType = SINGLE_BYTE_TYPE_BYTES.get(typeByte)
	if (singleByteType !== undefined) return {value: new singleByteType, length} //eslint-disable-line new-cap
	switch (typeByte) {
		case t.BooleanTupleType._value: {
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const tupleLength = castBuffer[offset + length]
			length++
			value = new t.BooleanTupleType(tupleLength)
			break
		}
		case t.TupleType._value: {
			const type = consumeType(typeBuffer, offset + length)
			length += type.length
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const tupleLength = castBuffer[offset + length]
			length++
			value = new t.TupleType({
				type: type.value,
				length: tupleLength
			})
			break
		}
		case t.StructType._value: {
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const fieldCount = castBuffer[offset + length]
			length++
			const fields = {}
			for (let i = 0; i < fieldCount; i++) { //read field information for each field
				assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
				const nameLength = castBuffer[offset + length]
				length++
				const nameStart = offset + length
				const nameEnd = nameStart + nameLength
				assert.assert(typeBuffer.byteLength >= nameEnd, NOT_LONG_ENOUGH)
				const name = bufferString.toString(castBuffer.subarray(nameStart, nameEnd)) //using castBuffer to be able to subarray it without copying
				length += nameLength
				const type = consumeType(typeBuffer, nameEnd)
				fields[name] = type.value
				length += type.length
			}
			value = new t.StructType(fields)
			break
		}
		case t.ArrayType._value: {
			const type = consumeType(typeBuffer, offset + length)
			length += type.length
			value = new t.ArrayType(type.value)
			break
		}
		case t.SetType._value: {
			const type = consumeType(typeBuffer, offset + length)
			length += type.length
			value = new t.SetType(type.value)
			break
		}
		case t.MapType._value: {
			const keyType = consumeType(typeBuffer, offset + length)
			length += keyType.length
			const valueType = consumeType(typeBuffer, offset + length)
			length += valueType.length
			value = new t.MapType(keyType.value, valueType.value)
			break
		}
		case t.EnumType._value: {
			const type = consumeType(typeBuffer, offset + length)
			length += type.length
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const valueCount = new Uint8Array(typeBuffer)[offset + length]
			length++
			const values = new Array(valueCount)
			for (let i = 0; i < valueCount; i++) {
				const valueLocation = offset + length
				const value = consumeValue({ //reading values rather than types
					buffer: typeBuffer,
					pointerStart: valueLocation,
					offset: valueLocation,
					type: type.value
				})
				length += value.length
				values[i] = value.value
			}
			value = new t.EnumType({
				type: type.value,
				values
			})
			break
		}
		case t.ChoiceType._value: {
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const typeCount = new Uint8Array(typeBuffer)[offset + length]
			length++
			const types = new Array(typeCount)
			for (let i = 0; i < typeCount; i++) {
				const type = consumeType(typeBuffer, offset + length)
				types[i] = type.value
				length += type.length
			}
			value = new t.ChoiceType(types)
			break
		}
		case t.NamedChoiceType._value: {
			assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const typeCount = castBuffer[offset + length]
			length++
			const constructorTypes = new Map
			for (let i = 0; i < typeCount; i++) {
				assert.assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
				const nameLength = castBuffer[offset + length]
				length++
				const nameStart = offset + length
				const nameEnd = nameStart + nameLength
				assert.assert(typeBuffer.byteLength >= nameEnd, NOT_LONG_ENOUGH)
				const name = bufferString.toString(castBuffer.subarray(nameStart, nameEnd)) //using castBuffer to be able to subarray it without copying
				length += nameLength
				const type = consumeType(typeBuffer, nameEnd)
				constructorTypes.set(constructorRegistry.get(name), type.value)
				length += type.length
			}
			value = new t.NamedChoiceType(constructorTypes)
			break
		}
		case t.RecursiveType._value: {
			assert.assert(typeBuffer.byteLength >= offset + length + 2, NOT_LONG_ENOUGH)
			const id = new DataView(typeBuffer).getUint16(offset + length)
			length += 2
			let bufferRecursiveNames = recursiveNames.get(typeBuffer)
			let recursiveName
			if (bufferRecursiveNames) recursiveName = bufferRecursiveNames.get(id) //see whether this type was previously read
			else {
				bufferRecursiveNames = new Map
				recursiveNames.set(typeBuffer, bufferRecursiveNames)
			}
			if (!recursiveName) { //if we have never read to type yet, the type def must lie here
				do {
					recursiveName = 'read-type'
					for (let charCount = 0; charCount < RECURSIVE_NAME_LENGTH; charCount++) { //add some hex chars
						recursiveName += Math.floor(Math.random() * 16).toString(16)
					}
				} while (recursiveRegistry.isRegistered(recursiveName)) //make sure name doesn't conflict
				bufferRecursiveNames.set(id, recursiveName) //register type before reading type definition so it can refer to this recursive type
				const type = consumeType(typeBuffer, offset + length)
				length += type.length
				recursiveRegistry.registerType({
					type: type.value,
					name: recursiveName
				})
			}
			/*If we have already read the type, then we are either reading a recursive type without the type def
			  or we are reading a repeated type (in which case we don't have to care about the length of the read)
			  so we can safely reuse old value*/
			value = new t.RecursiveType(recursiveName)
			break
		}
		case t.OptionalType._value: {
			const type = consumeType(typeBuffer, offset + length)
			length += type.length
			value = new t.OptionalType(type.value)
			break
		}
		case t.PointerType._value: {
			const type = consumeType(typeBuffer, offset + length)
			length += type.length
			value = new t.PointerType(type.value)
			break
		}
		case t.REPEATED_TYPE: {
			const newLength = length + 2
			assert.assert(typeBuffer.byteLength >= offset + newLength, NOT_LONG_ENOUGH)
			const locationOffset = new DataView(typeBuffer).getUint16(offset + length)
			;({value} = consumeType(typeBuffer, offset + length - locationOffset))
			length = newLength
			break
		}
		default:
			assert.fail('No such type: 0x' + pad(new Uint8Array(typeBuffer)[offset].toString(16), 2))
	}
	return {value, length}
}
function type(typeBuffer, fullBuffer = true) {
	assert.instanceOf(typeBuffer, ArrayBuffer)
	const {value, length} = consumeType(typeBuffer, 0)
	if (fullBuffer) assert.assert(length === typeBuffer.byteLength, 'Did not consume all of the buffer')
	return value
}
function value({buffer, type, offset = 0}) {
	assert.instanceOf(buffer, ArrayBuffer)
	assert.instanceOf(type, t.Type)
	assert.instanceOf(offset, Number)
	const {value} = consumeValue({buffer, offset, type, pointerStart: offset})
	//no length validation because bytes being pointed to don't get counted in the length
	return value
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
}