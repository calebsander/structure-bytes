import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {BufferOffset, readFlexInt} from '../lib/read-util'
import strToNum from '../lib/str-to-num'
import IntegerType from './integer'

/**
 * Converts a signed integer value
 * to a unique unsigned integer value
 * @param signed The signed integer value
 */
const toUnsigned = (signed: number): number =>
	signed < 0
		? -2 * signed - 1
		: 2 * signed
/**
 * Converts an unsigned integer value
 * to a unique signed integer value.
 * The inverse of [[toUnsigned]].
 * @param signed The unsigned integer value
 */
const fromUnsigned = (unsigned: number): number =>
	unsigned & 1
		? (unsigned + 1) / -2
		: unsigned / 2
const MIN_SAFE = fromUnsigned(Number.MAX_SAFE_INTEGER) //< 0; inclusive
const MAX_SAFE = fromUnsigned(Number.MAX_SAFE_INTEGER - 1) + 1 //> 0; exclusive

/**
 * Works like [[FlexUnsignedIntType]],
 * but allows for negative values as well.
 * Less efficient for storing positive values
 * than [[FlexUnsignedIntType]], so use that
 * instead if not storing negative values.
 * Also limited to values between
 * `-(2 ** 52)` and `2 ** 52 - 1`.
 * (Encodes `value` as approximately `2 * abs(value)`.)
 *
 * Example:
 * ````javascript
 * let type = new sb.FlexIntType
 * ````
 */
export class FlexIntType extends IntegerType<number | string, number> {
	static get _value(): number {
		return 0x07
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * //Takes 4 bytes
	 * type.writeValue(buffer, -2113664) //or '-2113664'
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: number | string): void {
		assert.isBuffer(buffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(MIN_SAFE, value, MAX_SAFE)
		buffer.addAll(flexInt.makeValueBuffer(toUnsigned(value)))
	}
	consumeValue(bufferOffset: BufferOffset): number {
		const value = readFlexInt(bufferOffset)
		return fromUnsigned(value)
	}
}