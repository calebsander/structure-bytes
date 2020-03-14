//This file contains functions for reading types from bytes

import * as assert from './lib/assert'
import {REPEATED_TYPE} from './lib/constants'
import {NOT_LONG_ENOUGH, readFlexInt, ReadResult} from './lib/read-util'
import {hexByte} from './lib/util-inspect'
import * as recursiveRegistry from './recursive-registry'
import type {RegisterableType} from './recursive-registry-type'
import * as t from './types'
import AbstractType from './types/abstract'

//Types whose type bytes are only 1 byte long (the type byte)
const SINGLE_BYTE_TYPES: (typeof AbstractType)[] = []
{
	const defaultAddToBuffer = AbstractType.prototype.addToBuffer
	const tTypes = t as unknown as Record<string, typeof AbstractType>
	//tslint:disable-next-line:forin
	for (const typeName in tTypes) {
		const testType = tTypes[typeName]
		if (testType.prototype.addToBuffer === defaultAddToBuffer) SINGLE_BYTE_TYPES.push(testType)
	}
}
type NoParamsType = new () => t.Type<unknown>
//Mapping of type bytes to the corresponding types
const SINGLE_BYTE_TYPE_BYTES = new Map<number, NoParamsType>()
for (const singleByteType of SINGLE_BYTE_TYPES) {
	SINGLE_BYTE_TYPE_BYTES.set(singleByteType._value, singleByteType as unknown as NoParamsType)
}

//Number of random characters in synthetic recursive type names
const RECURSIVE_NAME_LENGTH = 16
//Map of type buffers to maps of ids to synthetic recursive type names
const recursiveNames = new WeakMap<ArrayBuffer, Map<number, string>>()

const stringType = new t.StringType

//Reads a type from the specified bytes at the specified offset
//Returns the type that was read and the number of bytes consumed
function consumeType(typeBuffer: ArrayBuffer, offset: number): ReadResult<t.Type<unknown>> {
	if (offset < 0) throw new RangeError(`Offset is negative: ${offset}`)
	const castBuffer = new Uint8Array(typeBuffer)
	if (typeBuffer.byteLength <= offset) throw new Error(NOT_LONG_ENOUGH) //make sure there is a type byte
	const typeByte = castBuffer[offset]
	let readType: t.Type<unknown>, length = 1 //going to be at least one type byte
	const singleByteType = SINGLE_BYTE_TYPE_BYTES.get(typeByte)
	if (singleByteType) return {value: new singleByteType, length}
	switch (typeByte) {
		case t.BooleanTupleType._value: {
			const tupleLength = readFlexInt(typeBuffer, offset + length)
			length += tupleLength.length
			readType = new t.BooleanTupleType(tupleLength.value)
			break
		}
		case t.TupleType._value: {
			const elementType = consumeType(typeBuffer, offset + length)
			length += elementType.length
			const tupleLength = readFlexInt(typeBuffer, offset + length)
			length += tupleLength.length
			readType = new t.TupleType({
				type: elementType.value,
				length: tupleLength.value
			})
			break
		}
		case t.StructType._value: {
			const structFields = readFlexInt(typeBuffer, offset + length)
			length += structFields.length
			const fieldCount = structFields.value
			const fields: Record<string, t.Type<unknown>> = {}
			for (let i = 0; i < fieldCount; i++) { //read field information for each field
				const fieldName = stringType.consumeValue(typeBuffer, offset + length)
				length += fieldName.length
				const fieldType = consumeType(typeBuffer, offset + length)
				fields[fieldName.value] = fieldType.value
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
			const enumCount = readFlexInt(typeBuffer, offset + length)
			length += enumCount.length
			const valueCount = enumCount.value
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
			const choiceCount = readFlexInt(typeBuffer, offset + length)
			length += choiceCount.length
			const typeCount = choiceCount.value
			const types = new Array<t.Type<unknown>>(typeCount)
			for (let i = 0; i < typeCount; i++) {
				const possibleType = consumeType(typeBuffer, offset + length)
				types[i] = possibleType.value
				length += possibleType.length
			}
			readType = new t.ChoiceType(types)
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
		case t.SingletonType._value: {
			const valueType = consumeType(typeBuffer, offset + length)
			length += valueType.length
			const subType = valueType.value
			const value = subType.consumeValue(typeBuffer, offset + length)
			length += value.length
			readType = new t.SingletonType({type: subType, value: value.value})
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
			throw new Error(`No such type: 0x${hexByte(castBuffer[offset])}`)
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
export function type(typeBuffer: ArrayBuffer | Uint8Array, fullBuffer = true): t.Type<unknown> {
	assert.instanceOf(typeBuffer, [ArrayBuffer, Uint8Array])
	let readBuffer: ArrayBuffer, readOffset: number
	if (typeBuffer instanceof ArrayBuffer) {
		readBuffer = typeBuffer
		readOffset = 0
	}
	else {
		readBuffer = typeBuffer.buffer
		readOffset = typeBuffer.byteOffset
	}
	const {value, length} = consumeType(readBuffer, readOffset)
	if (fullBuffer && length !== typeBuffer.byteLength) {
		throw new Error('Did not consume all of the buffer')
	}
	return value
}