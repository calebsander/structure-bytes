//This file contains functions for reading types and values from bytes

import assert from './lib/assert'
import {dividedByEight, modEight} from './lib/bit-math'
import * as bufferString from './lib/buffer-string'
import {REPEATED_TYPE} from './lib/constants'
import * as constructorRegistry from './lib/constructor-registry'
import * as date from './lib/date'
import * as flexInt from './lib/flex-int'
import * as strint from './lib/strint'
import {inspect} from './lib/util-inspect'
import * as recursiveRegistry from './recursive-registry'
import {RegisterableType} from './recursive-registry-type'
import * as t from './types'
import AbstractType from './types/abstract'

export interface ReadResult<E> {
	value: E
	length: number
}

const NOT_LONG_ENOUGH = 'Buffer is not long enough'
function readFlexInt(buffer: ArrayBuffer, offset: number): ReadResult<number> {
	assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
	const length = flexInt.getByteCount(new Uint8Array(buffer)[offset])
	assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
	return {
		value: flexInt.readValueBuffer(buffer.slice(offset, offset + length)),
		length
	}
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
interface TypeConstructor {
	new (): t.Type<any>
}
//Mapping of type bytes to the corresponding types
const SINGLE_BYTE_TYPE_BYTES = new Map<number, TypeConstructor>()
for (const singleByteType of SINGLE_BYTE_TYPES) {
	SINGLE_BYTE_TYPE_BYTES.set(singleByteType._value, singleByteType)
}
//Pads a string with preceding 0s so that it has the desired length (for error messages)
function pad(str: string, digits: number): string {
	if (str.length < digits) return '0'.repeat(digits - str.length) + str
	else return str
}
//Returns an object to which keys are added when reading an instance of the specified type
//This allows the reference to the read value to be used before it is populated
function makeBaseValue(type: RegisterableType, count?: number) {
	switch (type.constructor) {
		case t.ArrayType: {
			return new Array(count)
		}
		case t.TupleType: {
			return new Array((type as t.TupleType<any>).length)
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
		default: throw new Error('Invalid type for base value: ' + inspect(type))
	}
}
interface ReadBooleansParams {
	buffer: ArrayBuffer
	offset: number
	count: number
	baseValue?: boolean[]
}
//Counterpart for writeBooleans() in structure-types.ts
function readBooleans({buffer, offset, count, baseValue}: ReadBooleansParams): ReadResult<boolean[]> {
	const value = baseValue || new Array<boolean>(count)
	const incompleteBytes = modEight(value.length)
	const bytes = dividedByEight(value.length)
	let byteLength: number
	if (incompleteBytes) byteLength = bytes + 1
	else byteLength = bytes
	assert(buffer.byteLength >= offset + byteLength, NOT_LONG_ENOUGH)
	const castBuffer = new Uint8Array(buffer)
	for (let i = 0; i < byteLength; i++) {
		const byte = castBuffer[offset + i]
		for (let bit = 0; bit < 8; bit++) {
			const index = i * 8 + bit
			if (index === value.length) break
			value[index] = !!(byte & (1 << modEight(~modEight(bit))))
		}
	}
	return {value, length: byteLength}
}
//Requires that a byte by 0x00 or 0xFF and returns its boolean value
function readBooleanByte(buffer: ArrayBuffer, offset: number): ReadResult<boolean> {
	assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
	let value: boolean
	const readByte = new Uint8Array(buffer)[offset]
	switch (readByte) {
		case 0x00:
		case 0xFF:
			value = Boolean(readByte)
			break
		default:
			throw new Error('0x' + pad(readByte.toString(16), 2) + ' is an invalid Boolean value')
	}
	return {value, length: 1}
}
//Map of value buffers to maps of indices to read values for recursive types
const readRecursives = new WeakMap<ArrayBuffer, Map<number, any>>()
interface ValueReadParams<E> {
	buffer: ArrayBuffer
	pointerStart: number
	offset: number
	type: t.Type<E>
	baseValue?: any
}
//Map of read value buffers to maps of pointer types to maps of pointer values to read results
const pointerReads = new WeakMap<ArrayBuffer, Map<t.PointerType<any>, Map<number, any>>>()
/*
	Reads a value from the specified bytes at the specified offset, given a type
	Returns the value that was read and the number of bytes consumed (excepting any values being pointed to)
	Pointer start refers to the position in the buffer where the root value starts
	(pointers will be relative to this location)
*/
function consumeValue<E>({buffer, pointerStart, offset, type, baseValue}: ValueReadParams<E>): ReadResult<E> {
	let value, length: number
	switch (type.constructor) {
		case t.ByteType: {
			length = 1
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new Int8Array(buffer)[offset] //endianness doesn't matter because there is only 1 byte
			break
		}
		case t.ShortType: {
			length = 2
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
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
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const upper = dataView.getInt32(offset)
			const lower = dataView.getUint32(offset + 4)
			value = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower))
			if (type.constructor === t.DateType) value = new Date(Number(value))
			break
		}
		case t.BigIntType: {
			const lengthInt = readFlexInt(buffer, offset)
			const bytes = lengthInt.value
			;({length} = lengthInt)
			assert(buffer.byteLength >= offset + length + bytes, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			if (bytes) {
				value = String(dataView.getInt8(offset + length))
				for (let byte = 1; byte < bytes; byte++) {
					value = strint.mul(value, strint.BYTE_SHIFT) //after the first byte, shift everything left one byte before adding
					value = strint.add(value, String(dataView.getUint8(offset + length + byte)))
				}
			}
			else value = '0'
			length += bytes
			break
		}
		case t.UnsignedByteType: {
			length = 1
			assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			value = new Uint8Array(buffer)[offset] //endianness doesn't matter because there is only 1 byte
			break
		}
		case t.UnsignedShortType: {
			length = 2
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getUint16(offset)
			break
		}
		case t.UnsignedIntType: {
			length = 4
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getUint32(offset)
			break
		}
		case t.UnsignedLongType: {
			length = 8
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const upper = dataView.getUint32(offset)
			const lower = dataView.getUint32(offset + 4)
			value = strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower))
			break
		}
		case t.BigUnsignedIntType: {
			const lengthInt = readFlexInt(buffer, offset)
			const bytes = lengthInt.value
			;({length} = lengthInt)
			assert(buffer.byteLength >= offset + length + bytes, NOT_LONG_ENOUGH)
			const castBuffer = new Uint8Array(buffer)
			value = '0'
			for (let byte = 0; byte < bytes; byte++, length++) {
				if (byte) value = strint.mul(value, strint.BYTE_SHIFT) //after the first byte, shift everything left one byte before adding
				value = strint.add(value, String(castBuffer[offset + length]))
			}
			break
		}
		case t.FlexUnsignedIntType: {
			({value, length} = readFlexInt(buffer, offset))
			break
		}
		case t.DayType: {
			length = 3
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			const dataView = new DataView(buffer)
			const day = (dataView.getInt16(offset) << 8) | dataView.getUint8(offset + 2)
			value = date.fromUTC(day * date.MILLIS_PER_DAY)
			break
		}
		case t.TimeType: {
			length = 4
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new Date(new DataView(buffer).getUint32(offset))
			break
		}
		case t.FloatType: {
			length = 4
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getFloat32(offset)
			break
		}
		case t.DoubleType: {
			length = 8
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			value = new DataView(buffer).getFloat64(offset)
			break
		}
		case t.BooleanType: {
			({value, length} = readBooleanByte(buffer, offset))
			break
		}
		case t.BooleanArrayType: {
			const arrayLength = readFlexInt(buffer, offset)
			;({length} = arrayLength)
			const booleans = readBooleans({buffer, offset: offset + length, count: arrayLength.value, baseValue})
			length += booleans.length
			;({value} = booleans)
			break
		}
		case t.BooleanTupleType: {
			({value, length} = readBooleans({buffer, offset, count: (type as any as t.BooleanTupleType).length, baseValue}))
			break
		}
		case t.CharType: {
			assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			value = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + 4))[0] //UTF-8 codepoint can't be more than 4 bytes
			length = bufferString.fromString(value).byteLength
			break
		}
		case t.StringType: {
			const castBuffer = new Uint8Array(buffer)
			for (length = 0; ; length++) {
				assert(buffer.byteLength > offset + length, NOT_LONG_ENOUGH)
				if (!castBuffer[offset + length]) break
			}
			value = bufferString.toString(new Uint8Array(buffer).subarray(offset, offset + length))
			length++ //account for null byte
			break
		}
		case t.OctetsType: {
			const octetsLength = readFlexInt(buffer, offset)
			;({length} = octetsLength)
			const finalLength = length + octetsLength.value
			assert(buffer.byteLength >= offset + finalLength, NOT_LONG_ENOUGH)
			value = buffer.slice(offset + length, offset + finalLength)
			length = finalLength
			break
		}
		case t.TupleType: {
			length = 0
			const castType = type as any as t.TupleType<any>
			value = baseValue || makeBaseValue(castType)
			for (let i = 0; i < castType.length; i++) {
				const element = consumeValue({buffer, pointerStart, offset: offset + length, type: castType.type})
				length += element.length
				value[i] = element.value
			}
			break
		}
		case t.StructType: {
			length = 0
			const castType = type as any as t.StructType<any>
			value = baseValue || makeBaseValue(castType)
			for (const field of castType.fields) {
				const readField = consumeValue({buffer, pointerStart, offset: offset + length, type: field.type})
				value[field.name] = readField.value
				length += readField.length
			}
			break
		}
		case t.ArrayType: {
			const arrayLengthInt = readFlexInt(buffer, offset)
			const arrayLength = arrayLengthInt.value
			;({length} = arrayLengthInt)
			const castType = type as any as t.ArrayType<any>
			value = baseValue || makeBaseValue(castType, arrayLength)
			for (let i = 0; i < arrayLength; i++) {
				const element = consumeValue({buffer, pointerStart, offset: offset + length, type: castType.type})
				length += element.length
				value[i] = element.value
			}
			break
		}
		case t.SetType: {
			const size = readFlexInt(buffer, offset)
			const setSize = size.value
			;({length} = size)
			const castType = type as any as t.SetType<any>
			value = baseValue || makeBaseValue(castType)
			for (let i = 0; i < setSize; i++) {
				const element = consumeValue({buffer, pointerStart, offset: offset + length, type: castType.type})
				length += element.length
				value.add(element.value)
			}
			break
		}
		case t.MapType: {
			const size = readFlexInt(buffer, offset)
			;({length} = size)
			const castType = type as any as t.MapType<any, any>
			value = baseValue || makeBaseValue(castType)
			for (let i = 0; i < size.value; i++) {
				const keyElement = consumeValue({buffer, pointerStart, offset: offset + length, type: castType.keyType})
				length += keyElement.length
				const valueElement = consumeValue({buffer, pointerStart, offset: offset + length, type: castType.valueType})
				length += valueElement.length
				value.set(keyElement.value, valueElement.value)
			}
			break
		}
		case t.EnumType: {
			length = 1
			assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const valueIndex = new Uint8Array(buffer)[offset]
			const {values} = type as any as t.EnumType<any>
			assert.between(0, valueIndex, values.length, 'Index ' + String(valueIndex) + ' is invalid')
			value = values[valueIndex]
			break
		}
		case t.ChoiceType: {
			length = 1
			assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const typeIndex = new Uint8Array(buffer)[offset]
			const subValue = consumeValue({
				buffer,
				pointerStart,
				offset: offset + length,
				type: (type as any as t.ChoiceType<any>).types[typeIndex]
			})
			length += subValue.length
			;({value} = subValue)
			break
		}
		case t.NamedChoiceType: {
			length = 1
			assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
			const typeIndex = new Uint8Array(buffer)[offset]
			const castType = type as any as t.NamedChoiceType<any>
			const typeConstructor = castType.indexConstructors.get(typeIndex)
			if (typeConstructor === undefined) throw new Error('Constructor index ' + String(typeIndex) + ' is invalid')
			const constructor = constructorRegistry.get(typeConstructor.name)
			const subValue = consumeValue({
				buffer,
				pointerStart,
				offset: offset + length,
				type: castType.constructorTypes[typeIndex].type,
				baseValue: new constructor
			})
			length += subValue.length
			;({value} = subValue)
			break
		}
		case t.RecursiveType: {
			let explicitValue: boolean
			({value: explicitValue, length} = readBooleanByte(buffer, offset))
			if (explicitValue) {
				const subType = (type as any as t.RecursiveType<any>).type
				value = makeBaseValue(subType)
				let bufferReadRecursives = readRecursives.get(buffer)
				if (!bufferReadRecursives) {
					bufferReadRecursives = new Map
					readRecursives.set(buffer, bufferReadRecursives)
				}
				bufferReadRecursives.set(offset + length, value)
				length += consumeValue({buffer, pointerStart, offset: offset + length, type: subType, baseValue: value}).length
			}
			else {
				const indexOffset = readFlexInt(buffer, offset + length)
				const target = offset + length - indexOffset.value
				value = (readRecursives.get(buffer) as Map<number, any>).get(target)
				assert(value, 'Cannot find target at ' + String(target))
				length += indexOffset.length
			}
			break
		}
		case t.OptionalType: {
			let nonNull: boolean
			({value: nonNull, length} = readBooleanByte(buffer, offset))
			if (nonNull) {
				const subValue = consumeValue({
					buffer,
					pointerStart,
					offset: offset + length,
					type: (type as any as t.OptionalType<any>).type
				})
				length += subValue.length
				;({value} = subValue)
			}
			else value = null
			break
		}
		case t.PointerType: {
			length = 4
			assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
			let bufferPointerReads = pointerReads.get(buffer)
			if (!bufferPointerReads) {
				bufferPointerReads = new Map
				pointerReads.set(buffer, bufferPointerReads)
			}
			const castType = type as any as t.PointerType<any>
			let bufferTypePointerReads = bufferPointerReads.get(castType)
			if (!bufferTypePointerReads) {
				bufferTypePointerReads = new Map
				bufferPointerReads.set(castType, bufferTypePointerReads)
			}
			const location = new DataView(buffer).getUint32(offset)
			if (bufferTypePointerReads.has(location)) value = bufferTypePointerReads.get(location)
			else {
				({value} = consumeValue({
					buffer,
					pointerStart,
					offset: pointerStart + location,
					type: castType.type
				}))
				bufferTypePointerReads.set(location, value)
			}
			break
		}
		default:
			throw new Error('Not a structure type: ' + inspect(type))
	}
	return {value, length}
}
//Number of random characters in synthetic recursive type names
const RECURSIVE_NAME_LENGTH = 16
//Map of type buffers to maps of ids to synthetic recursive type names
const recursiveNames = new WeakMap<ArrayBuffer, Map<number, string>>()
//Reads a type from the specified bytes at the specified offset
//Returns the type that was read and the number of bytes consumed
function consumeType(typeBuffer: ArrayBuffer, offset: number): ReadResult<t.Type<any>> {
	assert(offset >= 0, 'Offset is negative: ' + String(offset))
	const castBuffer = new Uint8Array(typeBuffer)
	assert(typeBuffer.byteLength > offset, NOT_LONG_ENOUGH) //make sure there is a type byte
	const typeByte = castBuffer[offset]
	let value: t.Type<any>, length = 1 //going to be at least one type byte
	const singleByteType = SINGLE_BYTE_TYPE_BYTES.get(typeByte)
	if (singleByteType) return {value: new singleByteType, length}
	switch (typeByte) {
		case t.BooleanTupleType._value: {
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const tupleLength = castBuffer[offset + length]
			length++
			value = new t.BooleanTupleType(tupleLength)
			break
		}
		case t.TupleType._value: {
			const type = consumeType(typeBuffer, offset + length)
			length += type.length
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const tupleLength = castBuffer[offset + length]
			length++
			value = new t.TupleType({
				type: type.value,
				length: tupleLength
			})
			break
		}
		case t.StructType._value: {
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const fieldCount = castBuffer[offset + length]
			length++
			const fields: {[key: string]: t.Type<any>} = {}
			for (let i = 0; i < fieldCount; i++) { //read field information for each field
				assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
				const nameLength = castBuffer[offset + length]
				length++
				const nameStart = offset + length
				const nameEnd = nameStart + nameLength
				assert(typeBuffer.byteLength >= nameEnd, NOT_LONG_ENOUGH)
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
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const valueCount = castBuffer[offset + length]
			length++
			const values = new Array(valueCount)
			for (let i = 0; i < valueCount; i++) {
				const valueLocation = offset + length
				const enumValue = consumeValue({ //reading values rather than types
					buffer: typeBuffer,
					pointerStart: valueLocation,
					offset: valueLocation,
					type: type.value
				})
				length += enumValue.length
				values[i] = enumValue.value
			}
			value = new t.EnumType({
				type: type.value,
				values
			})
			break
		}
		case t.ChoiceType._value: {
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const typeCount = castBuffer[offset + length]
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
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const typeCount = castBuffer[offset + length]
			length++
			const constructorTypes = new Map<Function, t.StructType<{}>>()
			for (let i = 0; i < typeCount; i++) {
				assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
				const nameLength = castBuffer[offset + length]
				length++
				const nameStart = offset + length
				const nameEnd = nameStart + nameLength
				assert(typeBuffer.byteLength >= nameEnd, NOT_LONG_ENOUGH)
				const name = bufferString.toString(castBuffer.subarray(nameStart, nameEnd)) //using castBuffer to be able to subarray it without copying
				length += nameLength
				const type = consumeType(typeBuffer, nameEnd)
				if (!(type.value instanceof t.StructType)) throw new Error('Not a StructType: ' + inspect(type.value))
				constructorTypes.set(constructorRegistry.get(name), type.value)
				length += type.length
			}
			value = new t.NamedChoiceType(constructorTypes)
			break
		}
		case t.RecursiveType._value: {
			const idInt = readFlexInt(typeBuffer, offset + length)
			const id = idInt.value
			length += idInt.length
			let bufferRecursiveNames = recursiveNames.get(typeBuffer)
			let recursiveName: string | undefined
			if (bufferRecursiveNames) recursiveName = bufferRecursiveNames.get(id) //see whether this type was previously read
			else {
				bufferRecursiveNames = new Map
				recursiveNames.set(typeBuffer, bufferRecursiveNames)
			}
			if (recursiveName === undefined) { //if we have never read to type yet, the type def must lie here
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
					type: type.value as RegisterableType,
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
		case REPEATED_TYPE: {
			const locationOffset = readFlexInt(typeBuffer, offset + length)
			;({value} = consumeType(typeBuffer, offset + length - locationOffset.value))
			length += locationOffset.length
			break
		}
		default:
			throw new Error('No such type: 0x' + pad(castBuffer[offset].toString(16), 2))
	}
	return {value, length}
}
/** @function
 * @private
 */
export {consumeType as _consumeType}
/** @function
 * @desc Reads a type from its written buffer
 * @param {external:Buffer} typeBuffer
 * The buffer containing the type bytes
 * @param {boolean} [fullBuffer=true] Whether to assert that
 * the whole buffer was read. In most use cases, should be omitted.
 * @return {Type} The type that was read
 */
function readType(typeBuffer: ArrayBuffer, fullBuffer = true): t.Type<any> {
	assert.instanceOf(typeBuffer, ArrayBuffer)
	const {value, length} = consumeType(typeBuffer, 0)
	if (fullBuffer) assert(length === typeBuffer.byteLength, 'Did not consume all of the buffer')
	return value
}
export {readType as type}
export interface ValueParams<E> {
	buffer: ArrayBuffer
	type: t.Type<E>
	offset?: number
}
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
function readValue<E>({buffer, type, offset = 0}: ValueParams<E>): E {
	assert.instanceOf(buffer, ArrayBuffer)
	assert.instanceOf(type, AbstractType)
	assert.instanceOf(offset, Number)
	const {value} = consumeValue({buffer, offset, type, pointerStart: offset})
	//no length validation because bytes being pointed to don't get counted in the length
	return value
}
export {readValue as value}