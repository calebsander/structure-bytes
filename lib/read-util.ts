import assert from './assert'
import {dividedByEight, modEight, timesEight} from './bit-math'
import * as flexInt from './flex-int'
import * as strint from './strint'
import {hexByte, inspect} from './util-inspect'
import {RegisterableType} from '../recursive-registry-type'
import ArrayType from '../types/array'
import MapType from '../types/map'
import SetType from '../types/set'
import StructType from '../types/struct'
import TupleType from '../types/tuple'

export const NOT_LONG_ENOUGH = 'Buffer is not long enough'

/**
 * The result of reading a value from bytes
 * @param E The type of value read
 */
export interface ReadResult<E> {
	/**
	 * The value read
	 */
	value: E
	/**
	 * The number of bytes used to store the value
	 */
	length: number
}

/**
 * Creates a value that can be mutated into a read value
 * for the given [[Type]].
 * This allows a reference to the read value to be used
 * before the read value is populated.
 * @param readType The [[Type]] reading a value
 * @param count If an [[ArrayType]], must pass in a length
 * to initialize the array value with
 * @return `[]`, `new Map`, `new Set`, or `{}`
 */
export function makeBaseValue(readType: RegisterableType, count?: number): any {
	switch (readType.constructor) {
		case ArrayType: return new Array(count)
		case TupleType: return new Array((readType as TupleType<any>).length)
		case MapType: return new Map
		case SetType: return new Set
		case StructType: return {}
		/*istanbul ignore next*/
		default: throw new Error('Invalid type for base value: ' + inspect(readType))
	}
}

/**
 * Reads a byte from the buffer,
 * requires it to be `0x00` or `0xFF`,
 * and returns its boolean value
 * @param buffer The buffer to read from
 * @param offset The position in `buffer`
 * of the byte to read
 * @return `true` if the byte is `0xFF`,
 * `false` if it is `0x00`
 */
export function readBooleanByte(buffer: ArrayBuffer, offset: number): ReadResult<boolean> {
	assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
	let value: boolean
	const readByte = new Uint8Array(buffer)[offset]
	switch (readByte) {
		case 0x00:
		case 0xFF:
			value = !!readByte
			break
		default:
			throw new Error(`0x${hexByte(readByte)} is an invalid Boolean value`)
	}
	return {value, length: 1}
}

export interface ReadBooleansParams {
	buffer: ArrayBuffer
	offset: number
	count: number
}
/**
 * Inverse of `writeBooleans()`, i.e. reads
 * a given number of booleans from binary data
 * @param buffer The bytes to read from
 * @param offset The position in `buffer`
 * of the first byte containing the booleans
 * @param count The number of boolean values to read
 * @return The array of booleans read
 */
export function readBooleans({buffer, offset, count}: ReadBooleansParams): ReadResult<boolean[]> {
	const value = new Array<boolean>(count)
	const incompleteBytes = modEight(count)
	const bytes = dividedByEight(count)
	const length = incompleteBytes ? bytes + 1 : bytes
	assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
	const castBuffer = new Uint8Array(buffer, offset)
	for (let i = 0; i < length; i++) {
		const byte = castBuffer[i]
		for (let bit = 0; bit < 8; bit++) {
			const index = timesEight(i) | bit
			if (index === count) break
			value[index] = Boolean(byte & (1 << (7 - bit)))
		}
	}
	return {value, length}
}

/**
 * Reads an unsigned integer in `flexInt` format
 * @param buffer The binary data to read from
 * @param offset The position of the first byte
 * of the `flexInt`
 * @return The number stored in the `flexInt`
 */
export function readFlexInt(buffer: ArrayBuffer, offset: number): ReadResult<number> {
	assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
	const castBuffer = new Uint8Array(buffer, offset)
	const length = flexInt.getByteCount(castBuffer[0])
	assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
	return {
		value: flexInt.readValueBuffer(castBuffer.slice(0, length).buffer),
		length
	}
}

/**
 * Reads a signed long
 * @param buffer The binary data to read from
 * @param offset The position of the first byte to read
 * @return The value stored in the `8` bytes
 * starting at `offset`, in string form
 */
export function readLong(buffer: ArrayBuffer, offset: number): ReadResult<string> {
	const length = 8
	assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
	const dataView = new DataView(buffer, offset)
	const upper = dataView.getInt32(0)
	const lower = dataView.getUint32(4)
	return {
		value: strint.add(strint.mul(`${upper}`, strint.LONG_UPPER_SHIFT), `${lower}`),
		length
	}
}

/**
 * A `TypedArray` constructor, e.g. `Uint8Array`
 */
export type TypedArray
	= typeof Int8Array
	| typeof Int16Array
	| typeof Int32Array
	| typeof Uint8Array
	| typeof Uint16Array
	| typeof Uint32Array
	| typeof Float32Array
	| typeof Float64Array
/**
 * The name of a `get*` method of `DataView`.
 * Method has the signature `(offset: number) => number`,
 * ignoring endianness.
 */
export type GetNumberFunction
	= 'getInt8'
	| 'getInt16'
	| 'getInt32'
	| 'getUint8'
	| 'getUint16'
	| 'getUint32'
	| 'getFloat32'
	| 'getFloat64'
/**
 * A `TypedArray` type and the name of the
 * corresponding `DataView` `get*` method
 */
export interface TypeAndFunc {
	func: GetNumberFunction
	type: TypedArray
}
/**
 * Creates an [[AbstractType.consumeValue]] method
 * for a type corresponding to an element of a `TypedArray`.
 * @param func The `DataView.get*` method,
 * e.g. `'getUint8'`
 * @param type The corresponding `TypedArray` constructor,
 * e.g. `Uint8Array`
 * @return A function that takes in an `ArrayBuffer`
 * and an offset in the buffer and reads a `number`,
 * much like [[AbstractType.consumeValue]]
 */
export function readNumber({func, type}: TypeAndFunc) {
	const length = type.BYTES_PER_ELEMENT
	return (buffer: ArrayBuffer, offset: number): ReadResult<number> => {
		assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
		return {
			value: new DataView(buffer)[func](offset),
			length
		}
	}
}