import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
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
export default class BigUnsignedIntType extends UnsignedType<string> {
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
		const byteBuffer = new ArrayBuffer(bytes.length)
		const castBuffer = new Uint8Array(byteBuffer)
		let offset = 0
		for (let i = bytes.length - 1; i >= 0; i--, offset++) castBuffer[offset] = bytes[i] //write in reverse order to get BE
		buffer
			.addAll(flexInt.makeValueBuffer(bytes.length))
			.addAll(byteBuffer)
	}
}