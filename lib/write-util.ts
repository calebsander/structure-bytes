import type {AppendableBuffer} from './appendable'
import * as assert from './assert'
import {timesEight} from './bit-math'
import * as flexInt from './flex-int'
import type {Type} from '../types'

/**
 * Writes a single boolean value to a buffer.
 * `true` is written as `0xFF`; `false` is written as `0x00`.
 * @param buffer The buffer to which to append the byte
 * @param value The boolean value to write
 */
export const writeBooleanByte = (buffer: AppendableBuffer, value: boolean): AppendableBuffer =>
	buffer.add(value ? 0xFF : 0x00) //set all bits for good measure

/**
 * Writes an array of booleans for [[BooleanTupleType]]
 * or [[BooleanArrayType]].
 * The boolean at index `8 * a + b` (where `a` is an integer
 * and `b` is an integer from `0` to `7`) is in the `b`th MSB
 * (0-indexed) of the `a`th appended byte.
 * @param buffer The buffer to which to append the bytes
 * @param booleans The boolean values to write
 */
export function writeBooleans(buffer: AppendableBuffer, booleans: boolean[]): void {
	assert.instanceOf(booleans, Array)
	byteLoop: for (let byteIndex = 0;; byteIndex++) {
		let byteValue = 0
		for (let bit = 0; bit < 8; bit++) {
			const booleanIndex = timesEight(byteIndex) | bit
			if (booleanIndex === booleans.length) {
				if (bit) buffer.add(byteValue)
				break byteLoop
			}
			const bool = booleans[booleanIndex]
			assert.instanceOf(bool, Boolean)
			if (bool) byteValue |= 1 << (7 - bit) //go from most significant bit to least significant
		}
		buffer.add(byteValue)
	}
}

export interface IterableWriteParams<E> {
	type: Type<E>
	buffer: AppendableBuffer
	value: Iterable<E>
	length: number
}

/**
 * Writes any iterable value to the buffer.
 * Used by [[ArrayType]] and [[SetType]].
 * Appends value bytes to an [[AppendableBuffer]] according to the type.
 * @param type The type to use to write individual elements
 * @param buffer The buffer to which to append
 * @param value The value to write
 * @param length The number of elements in `value`
 * @throws If the value doesn't match the type, e.g. `new sb.ArrayType().writeValue(buffer, 23)`
 */
export function writeIterable<E>({type, buffer, value, length}: IterableWriteParams<E>): void {
	buffer.addAll(flexInt.makeValueBuffer(length))
	for (const instance of value) type.writeValue(buffer, instance)
}

/**
 * Writes the given string value as a signed long (8 bytes)
 * @param buffer The buffer to which to append
 * @param value The value to write (a numeric string)
 */
export function writeLong(buffer: AppendableBuffer, value: bigint): void {
	assert.instanceOf(value, BigInt)
	if (value !== BigInt.asIntN(64, value)) throw new RangeError('Value out of range')
	const byteBuffer = new ArrayBuffer(8)
	new DataView(byteBuffer).setBigInt64(0, value)
	buffer.addAll(byteBuffer)
}