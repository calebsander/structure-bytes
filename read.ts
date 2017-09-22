//This file contains functions for reading types from bytes

import assert from './lib/assert'
import * as bufferString from './lib/buffer-string'
import {REPEATED_TYPE} from './lib/constants'
import * as constructorRegistry from './lib/constructor-registry'
import {NOT_LONG_ENOUGH, pad, readFlexInt, ReadResult} from './lib/read-util'
import {inspect} from './lib/util-inspect'
import * as recursiveRegistry from './recursive-registry'
import {RegisterableType} from './recursive-registry-type'
import * as t from './types'
import AbstractType from './types/abstract'

//Types whose type bytes are only 1 byte long (the type byte)
const SINGLE_BYTE_TYPES: (typeof AbstractType)[] = []
interface Types {
	[typeName: string]: typeof AbstractType
}
{
	const defaultAddToBuffer = AbstractType.prototype.addToBuffer
	const tTypes = t as any as Types
	//tslint:disable-next-line:forin
	for (const typeName in tTypes) {
		const testType = tTypes[typeName]
		if (testType.prototype.addToBuffer === defaultAddToBuffer) SINGLE_BYTE_TYPES.push(testType)
	}
}
interface NoParamsType {
	new(): t.Type<any>
}
//Mapping of type bytes to the corresponding types
const SINGLE_BYTE_TYPE_BYTES = new Map<number, NoParamsType>()
for (const singleByteType of SINGLE_BYTE_TYPES) {
	SINGLE_BYTE_TYPE_BYTES.set(singleByteType._value, singleByteType as any as NoParamsType)
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
	let readType: t.Type<any>, length = 1 //going to be at least one type byte
	const singleByteType = SINGLE_BYTE_TYPE_BYTES.get(typeByte)
	if (singleByteType) return {value: new singleByteType, length}
	switch (typeByte) {
		case t.BooleanTupleType._value: {
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const tupleLength = castBuffer[offset + length]
			length++
			readType = new t.BooleanTupleType(tupleLength)
			break
		}
		case t.TupleType._value: {
			const elementType = consumeType(typeBuffer, offset + length)
			length += elementType.length
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const tupleLength = castBuffer[offset + length]
			length++
			readType = new t.TupleType({
				type: elementType.value,
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
				const fieldType = consumeType(typeBuffer, nameEnd)
				fields[name] = fieldType.value
				length += fieldType.length
			}
			readType = new t.StructType(fields)
			break
		}
		case t.ArrayType._value: {
			const elementType = consumeType(typeBuffer, offset + length)
			length += elementType.length
			readType = new t.ArrayType(elementType.value)
			break
		}
		case t.SetType._value: {
			const elementType = consumeType(typeBuffer, offset + length)
			length += elementType.length
			readType = new t.SetType(elementType.value)
			break
		}
		case t.MapType._value: {
			const keyType = consumeType(typeBuffer, offset + length)
			length += keyType.length
			const valueType = consumeType(typeBuffer, offset + length)
			length += valueType.length
			readType = new t.MapType(keyType.value, valueType.value)
			break
		}
		case t.EnumType._value: {
			const valueType = consumeType(typeBuffer, offset + length)
			const subType = valueType.value
			length += valueType.length
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const valueCount = castBuffer[offset + length]
			length++
			const values = new Array(valueCount)
			for (let i = 0; i < valueCount; i++) {
				const valueLocation = offset + length
				const enumValue = subType.consumeValue(typeBuffer, valueLocation) //reading values rather than types
				length += enumValue.length
				values[i] = enumValue.value
			}
			readType = new t.EnumType({type: subType, values})
			break
		}
		case t.ChoiceType._value: {
			assert(typeBuffer.byteLength > offset + length, NOT_LONG_ENOUGH)
			const typeCount = castBuffer[offset + length]
			length++
			const types = new Array(typeCount)
			for (let i = 0; i < typeCount; i++) {
				const possibleType = consumeType(typeBuffer, offset + length)
				types[i] = possibleType.value
				length += possibleType.length
			}
			readType = new t.ChoiceType(types)
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
				const possibleType = consumeType(typeBuffer, nameEnd)
				if (!(possibleType.value instanceof t.StructType)) throw new Error('Not a StructType: ' + inspect(possibleType.value))
				constructorTypes.set(constructorRegistry.get(name), possibleType.value)
				length += possibleType.length
			}
			readType = new t.NamedChoiceType(constructorTypes)
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
				const subType = consumeType(typeBuffer, offset + length)
				length += subType.length
				recursiveRegistry.registerType({
					type: subType.value as RegisterableType,
					name: recursiveName
				})
			}
			/*If we have already read the type, then we are either reading a recursive type without the type def
			  or we are reading a repeated type (in which case we don't have to care about the length of the read)
			  so we can safely reuse old value*/
			readType = new t.RecursiveType(recursiveName)
			break
		}
		case t.OptionalType._value: {
			const subType = consumeType(typeBuffer, offset + length)
			length += subType.length
			readType = new t.OptionalType(subType.value)
			break
		}
		case t.PointerType._value: {
			const subType = consumeType(typeBuffer, offset + length)
			length += subType.length
			readType = new t.PointerType(subType.value)
			break
		}
		case REPEATED_TYPE: {
			const locationOffset = readFlexInt(typeBuffer, offset + length)
			readType = consumeType(typeBuffer, offset + length - locationOffset.value).value
			length += locationOffset.length
			break
		}
		default:
			throw new Error('No such type: 0x' + pad(castBuffer[offset].toString(16), 2))
	}
	return {value: readType, length}
}
export {consumeType as _consumeType}
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
export function type(typeBuffer: ArrayBuffer, fullBuffer = true): t.Type<any> {
	assert.instanceOf(typeBuffer, ArrayBuffer)
	const {value: readValue, length} = consumeType(typeBuffer, 0)
	if (fullBuffer) assert(length === typeBuffer.byteLength, 'Did not consume all of the buffer')
	return readValue
}