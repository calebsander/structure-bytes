import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {NOT_LONG_ENOUGH, readFlexInt, ReadResult} from '../lib/read-util'
import * as strint from '../lib/strint'
import UnsignedType from './unsigned'

/**
 * A type storing an arbitrary precision unsigned integer.
 * Each written value has its own number of bytes of precision.
 * Values must be provided as base-10 strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.BigUnsignedIntType
 * ````
 */
export default class BigUnsignedIntType extends UnsignedType<string, string> {
	static get _value() {
		return 0x15
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Examples:
	 * ````javascript
	 * type.writeValue(buffer, '1') //takes up 2 bytes
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, '12345678901234567890') //takes up 9 bytes
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: string) {
		this.isBuffer(buffer)
		assert.instanceOf(value, String)
		assert(!strint.isNegative(value), 'Value out of range')
		const bytes: number[] = []
		if (!strint.eq(value, '0')) { //if value is 0, avoid adding a 0 byte
			while (strint.ge(value, strint.BYTE_SHIFT)) { //builds bytes in LE order
				const [quotient, remainder] = strint.quotientRemainderPositive(value, strint.BYTE_SHIFT)
				bytes.push(Number(remainder))
				value = quotient
			}
			bytes.push(Number(value))
		}
		const byteBuffer = new Uint8Array(bytes.length)
		for (let i = bytes.length - 1, offset = 0; i >= 0; i--, offset++) byteBuffer[offset] = bytes[i] //write in reverse order to get BE
		buffer
			.addAll(flexInt.makeValueBuffer(bytes.length))
			.addAll(byteBuffer.buffer)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<string> {
		const lengthInt = readFlexInt(buffer, offset)
		const bytes = lengthInt.value
		let {length} = lengthInt
		assert(buffer.byteLength >= offset + length + bytes, NOT_LONG_ENOUGH)
		const castBuffer = new Uint8Array(buffer, offset + length)
		let value = '0'
		for (let byte = 0; byte < bytes; byte++) {
			value = strint.add(
				strint.mul(value, strint.BYTE_SHIFT),
				`${castBuffer[byte]}`
			)
		}
		length += bytes
		return {value, length}
	}
}