import {dividedByEight, modEight, timesEight} from './bit-math'
import * as flexInt from './flex-int'
import {hexByte, inspect} from './util-inspect'
import type {RegisterableType} from '../recursive-registry-type'
import {ArrayType} from '../types/array'
import {MapType} from '../types/map'
import {SetType} from '../types/set'
import {StructType} from '../types/struct'
import {TupleType} from '../types/tuple'

export const NOT_LONG_ENOUGH = 'Buffer is not long enough'

/**
 * Represents a location in a read buffer.
 * By wrapping `offset` in an object, it can be easily mutated.
 *
 * Example:
 * ```js
 * const {buffer} = new Uint8Array([1, 2, 3])
 * const bufferOffset = {buffer, offset: 0}
 * console.log(readBytes(bufferOffset, 1)) //new Uint8Array([1])
 * console.log(readBytes(bufferOffset, 2)) //new Uint8Array([2, 3])
 * ```
 */
export interface BufferOffset {
	/**
	 * The buffer being read from
	 */
	buffer: ArrayBuffer
	/**
	 * The current position in the buffer.
	 * Reads can be made anywhere in the buffer, but generally read the buffer in order.
	 * By incrementing `offset`, consecutive read operations can use the same BufferOffset.
	 */
	offset: number
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
export function makeBaseValue(readType: RegisterableType, count?: number): unknown {
	switch (readType.constructor) {
		case ArrayType: return new Array(count)
		case TupleType: return new Array((readType as TupleType<unknown>).length)
		case MapType: return new Map
		case SetType: return new Set
		case StructType: return {}
		/*istanbul ignore next*/
		default: throw new Error('Invalid type for base value: ' + inspect(readType))
	}
}

/**
 * Reads a given number of bytes at the given buffer offset
 * and advances the offset in the buffer
 * @param bufferOffset The buffer and its current offset
 * @param length The number of bytes to read
 * @return A Uint8Array view of the read bytes
 */
export function readBytes(bufferOffset: BufferOffset, length: number): Uint8Array {
	const {buffer, offset} = bufferOffset
	const newOffset = offset + length
	if (buffer.byteLength < newOffset) throw new Error(NOT_LONG_ENOUGH)

	bufferOffset.offset = newOffset
	return new Uint8Array(buffer, offset, length)
}

/**
 * Reads a byte from the buffer,
 * requires it to be `0x00` or `0xFF`,
 * and returns its boolean value
 * @param bufferOffset The buffer and its current offset, the byte to read
 * @return `true` if the byte is `0xFF`,
 * `false` if it is `0x00`
 */
export function readBooleanByte(offset: BufferOffset): boolean {
	const [readByte] = readBytes(offset, 1)
	switch (readByte) {
		case 0x00:
		case 0xFF:
			return !!readByte
		default:
			throw new Error(`0x${hexByte(readByte)} is an invalid Boolean value`)
	}
}

export interface ReadBooleansParams {
	bufferOffset: BufferOffset
	count: number
}
/**
 * Inverse of `writeBooleans()`, i.e. reads
 * a given number of booleans from binary data
 * @param bufferOffset The buffer and its current offset, the first byte of booleans
 * @param count The number of boolean values to read
 * @return The array of booleans read
 */
export function readBooleans({bufferOffset, count}: ReadBooleansParams): boolean[] {
	const value = new Array<boolean>(count)
	const incompleteBytes = modEight(count)
	const fullBytes = dividedByEight(count)
	const length = incompleteBytes ? fullBytes + 1 : fullBytes
	const bytes = readBytes(bufferOffset, length)
	for (let i = 0; i < length; i++) {
		const byte = bytes[i]
		for (let bit = 0; bit < 8; bit++) {
			const index = timesEight(i) | bit
			if (index === count) break
			value[index] = Boolean(byte >> (7 - bit) & 1)
		}
	}
	return value
}

/**
 * Reads an unsigned integer in `flexInt` format
 * @param bufferOffset The buffer and its current offset, the first byte of the `flexInt`
 * @return The number stored in the `flexInt`
 */
export function readFlexInt(bufferOffset: BufferOffset): number {
	const {offset} = bufferOffset
	const [firstByte] = readBytes(bufferOffset, 1)
	bufferOffset.offset = offset
	const length = flexInt.getByteCount(firstByte)
	const bytes = readBytes(bufferOffset, length)
	return flexInt.readValueBuffer(bytes)
}

/**
 * Reads a signed long
 * @param bufferOffset The buffer and its current offset
 * @return The value stored in the `8` bytes
 * starting at `bufferOffset.offset`, in string form
 */
export function readLong(bufferOffset: BufferOffset): bigint {
	const {buffer, offset} = bufferOffset
	readBytes(bufferOffset, 8)
	return new DataView(buffer).getBigInt64(offset)
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
 * @return A function that takes in a [[BufferOffset]] and reads a `number`,
 * much like [[AbstractType.consumeValue]]
 */
export function readNumber({func, type}: TypeAndFunc):
	(bufferOffset: BufferOffset) => number
{
	const length = type.BYTES_PER_ELEMENT
	return bufferOffset => {
		const {buffer, offset} = bufferOffset
		readBytes(bufferOffset, length)
		return new DataView(buffer)[func](offset)
	}
}

/**
 * Reads an unsigned 32-bit integer from a buffer
 * @param bufferOffset The buffer and its current offset
 * @return The integer read from the buffer
 */
export const readUnsignedInt = readNumber({type: Uint32Array, func: 'getUint32'})