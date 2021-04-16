//This file contains functions for reading types from bytes

import * as assert from './lib/assert'
import {REPEATED_TYPE} from './lib/constants'
import {BufferOffset, readBytes, readFlexInt} from './lib/read-util'
import {hexByte} from './lib/util-inspect'
import * as recursiveRegistry from './recursive-registry'
import type {RegisterableType} from './recursive-registry-type'
import * as t from './types'
import AbstractType from './types/abstract'

//A deserialized type. It could be any t.Type.
type Type = t.Type<unknown>
//Map of type buffers to maps of offsets to deserialized types.
//Used to implement reading REPEATED_TYPE.
const cachedTypeLocations = new WeakMap<ArrayBuffer, Map<number, Type>>()

//Number of random characters in synthetic recursive type names
const RECURSIVE_NAME_LENGTH = 16
//Map of type buffers to maps of ids to synthetic recursive type names
const recursiveNames = new WeakMap<ArrayBuffer, Map<number, string>>()

const stringType = new t.StringType

//A type construtor taking no arguments
type NoParamsType = new () => Type
//A function that reads a Type from a buffer
type TypeReader = (bufferOffset: BufferOffset) => Type
//A sparse array indexed by type bytes, whose entries are TypeReaders for those types.
const TYPE_READERS = new Array<TypeReader>(256)
//Add readers for all types that don't have any parameters
{
	const defaultAddToBuffer = AbstractType.prototype.addToBuffer
	const tTypes = t as unknown as Record<string, typeof AbstractType>
	for (const typeName in tTypes) {
		const testType = tTypes[typeName]
		if (testType.prototype.addToBuffer === defaultAddToBuffer) {
			const singleByteType = testType as unknown as NoParamsType
			TYPE_READERS[testType._value] = () => new singleByteType
		}
	}
}
//Add readers for types that take additional parameters
TYPE_READERS[t.BooleanTupleType._value] = bufferOffset => {
	const tupleLength = readFlexInt(bufferOffset)
	return new t.BooleanTupleType(tupleLength)
}
TYPE_READERS[t.TupleType._value] = bufferOffset => {
	const type = consumeType(bufferOffset)
	const length = readFlexInt(bufferOffset)
	return new t.TupleType({type, length})
}
TYPE_READERS[t.StructType._value] = bufferOffset => {
	const fieldCount = readFlexInt(bufferOffset)
	const fields: Record<string, Type> = {}
	for (let i = 0; i < fieldCount; i++) { //read field information for each field
		const fieldName = stringType.consumeValue(bufferOffset)
		fields[fieldName] = consumeType(bufferOffset)
	}
	return new t.StructType(fields)
}
TYPE_READERS[t.ArrayType._value] = bufferOffset => {
	const elementType = consumeType(bufferOffset)
	return new t.ArrayType(elementType)
}
TYPE_READERS[t.SetType._value] = bufferOffset => {
	const elementType = consumeType(bufferOffset)
	return new t.SetType(elementType)
}
TYPE_READERS[t.MapType._value] = bufferOffset => {
	const keyType = consumeType(bufferOffset)
	const valueType = consumeType(bufferOffset)
	return new t.MapType(keyType, valueType)
}
TYPE_READERS[t.EnumType._value] = bufferOffset => {
	const type = consumeType(bufferOffset)
	const valueCount = readFlexInt(bufferOffset)
	const values = new Array<unknown>(valueCount)
	for (let i = 0; i < valueCount; i++) {
		values[i] = type.consumeValue(bufferOffset) //reading values rather than types
	}
	return new t.EnumType({type, values})
}
TYPE_READERS[t.ChoiceType._value] = bufferOffset => {
	const typeCount = readFlexInt(bufferOffset)
	const types = new Array<Type>(typeCount)
	for (let i = 0; i < typeCount; i++) {
		types[i] = consumeType(bufferOffset)
	}
	return new t.ChoiceType(types)
}
TYPE_READERS[t.RecursiveType._value] = bufferOffset => {
	const id = readFlexInt(bufferOffset)
	const {buffer} = bufferOffset
	let bufferRecursiveNames = recursiveNames.get(buffer)
	if (!bufferRecursiveNames) {
		recursiveNames.set(buffer, bufferRecursiveNames = new Map)
	}
	let name = bufferRecursiveNames.get(id) //see whether this type was previously read
	if (name === undefined) { //if we have never read to type yet, the type def must lie here
		do {
			name = 'read-type'
			for (let charCount = 0; charCount < RECURSIVE_NAME_LENGTH; charCount++) { //add some hex chars
				name += Math.floor(Math.random() * 16).toString(16)
			}
		} while (recursiveRegistry.isRegistered(name)) //make sure name doesn't conflict
		bufferRecursiveNames.set(id, name) //register type before reading type definition so it can refer to this recursive type
		const type = consumeType(bufferOffset) as RegisterableType
		recursiveRegistry.registerType({type, name})
	}
	/*If we have already read the type, then we are either reading a recursive type without the type def
		or we are reading a repeated type (in which case we don't have to care about the length of the read)
		so we can safely reuse old value*/
	return new t.RecursiveType(name)
}
TYPE_READERS[t.SingletonType._value] = bufferOffset => {
	const type = consumeType(bufferOffset)
	const value = type.consumeValue(bufferOffset)
	return new t.SingletonType({type, value})
}
TYPE_READERS[t.OptionalType._value] = bufferOffset => {
	const type = consumeType(bufferOffset)
	return new t.OptionalType(type)
}
TYPE_READERS[t.PointerType._value] = bufferOffset => {
	const type = consumeType(bufferOffset)
	return new t.PointerType(type)
}
TYPE_READERS[REPEATED_TYPE] = bufferOffset => {
	const {buffer, offset} = bufferOffset
	const locationOffset = readFlexInt(bufferOffset)
	const location = offset - 1 - locationOffset //move back to the type byte, then by locationOffset
	const bufferCachedLocations = cachedTypeLocations.get(buffer)
	if (!bufferCachedLocations) throw new Error('Buffer has no repeated types')

	const type = bufferCachedLocations.get(location)
	if (!type) throw new Error(`No type was read at offset ${location}`)

	return type
}

/**
 * Reads a type from a buffer and advances its offset
 * @param bufferOffset The buffer and its current offset
 * @return The deserialized type
 */
export const consumeType: TypeReader = bufferOffset => {
	const {offset} = bufferOffset
	if (offset < 0) throw new RangeError(`Offset is negative: ${offset}`)

	const [typeByte] = readBytes(bufferOffset, 1)
	const typeReader: TypeReader | undefined = TYPE_READERS[typeByte]
	if (!typeReader) throw new Error(`No such type: 0x${hexByte(typeByte)}`)

	const result = typeReader(bufferOffset)
	//Record the type that was read at this offset
	const {buffer} = bufferOffset
	let bufferCachedLocations = cachedTypeLocations.get(buffer)
	if (!bufferCachedLocations) {
		cachedTypeLocations.set(buffer, bufferCachedLocations = new Map)
	}
	bufferCachedLocations.set(offset, result)
	return result
}
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
export function type(buffer: ArrayBuffer | Uint8Array, fullBuffer = true): Type {
	assert.instanceOf(buffer, [ArrayBuffer, Uint8Array])
	const bufferOffset = buffer instanceof ArrayBuffer
		? {buffer, offset: 0}
		: {buffer: buffer.buffer, offset: buffer.byteOffset}
	const {offset} = bufferOffset
	const value = consumeType(bufferOffset)
	if (fullBuffer && bufferOffset.offset !== offset + buffer.byteLength) {
		throw new Error('Did not consume all of the buffer')
	}
	return value
}