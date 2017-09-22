import assert from './assert'
import {dividedByEight, modEight, timesEight} from './bit-math'
import * as flexInt from './flex-int'
import * as strint from './strint'
import {inspect} from './util-inspect'
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
 * @param count If an [[ArrayType]], can pass in a length
 * to initialize the array value with
 * @return `[]`, `new Map`, `new Set`, or `{}`
 */
export function makeBaseValue(readType: RegisterableType, count?: number): any {
	switch (readType.constructor) {
		case ArrayType: return count === undefined ? [] : new Array(count)
		case TupleType: return new Array((readType as TupleType<any>).length)
		case MapType: return new Map
		case SetType: return new Set
		case StructType: return {}
		/*istanbul ignore next*/
		default: throw new Error('Invalid type for base value: ' + inspect(readType))
	}
}

/**
 * Pads a string with preceding `0` characters
 * so it has the desired length
 * (for readability)
 * @param str The numeric string
 * @param digits The target number of digits
 * @return `str` if str has at least enough digits,
 * otherwise `str` with enough zeros in front to have
 * the desired number of digits
 */
export function pad(str: string, digits: number): string {
	if (str.length < digits) return '0'.repeat(digits - str.length) + str
	else return str
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
	let readValue: boolean
	const readByte = new Uint8Array(buffer)[offset]
	switch (readByte) {
		case 0x00:
		case 0xFF:
			readValue = Boolean(readByte)
			break
		default:
			throw new Error('0x' + pad(readByte.toString(16), 2) + ' is an invalid Boolean value')
	}
	return {value: readValue, length: 1}
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
	const incompleteBytes = modEight(value.length)
	const bytes = dividedByEight(value.length)
	let length: number
	if (incompleteBytes) length = bytes + 1
	else length = bytes
	assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
	const castBuffer = new Uint8Array(buffer, offset)
	for (let i = 0; i < length; i++) {
		const byte = castBuffer[i]
		for (let bit = 0; bit < 8; bit++) {
			const index = timesEight(i) + bit
			if (index === value.length) break
			value[index] = !!(byte & (1 << modEight(~modEight(bit))))
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
		value: strint.add(strint.mul(String(upper), strint.LONG_UPPER_SHIFT), String(lower)),
		length
	}
}