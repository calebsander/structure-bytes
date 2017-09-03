import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import GrowableBuffer from '../lib/growable-buffer'
import * as strint from '../lib/strint'
import IntegerType from './integer'

/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
 * Values must be provided as base-10 strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.BigIntType
 * ````
 */
export default class BigIntType extends IntegerType<string> {
	static get _value() {
		return 0x05
	}
	/**
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Examples:
	 * ````javascript
	 * type.writeValue(buffer, '-1') //takes up 2 bytes
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, '12345678901234567890') //takes up 10 bytes
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: string) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		value = strint.normalize(value) //throws if value is invalid
		const bytes: number[] = []
		if (!strint.eq(value, '0')) {
			while (strint.gt(value, '127') || strint.lt(value, '-128')) { //builds bytes in LE order
				const quotient = strint.div(value, strint.BYTE_SHIFT, true)
				const remainder = strint.sub(value, strint.mul(quotient, strint.BYTE_SHIFT))
				bytes.push(Number(remainder))
				value = quotient
			}
			bytes.push(Number(value))
		}
		const byteBuffer = new ArrayBuffer(bytes.length)
		const dataView = new DataView(byteBuffer)
		for (let i = bytes.length - 2, offset = 1; i >= 0; i--, offset++) { //write in reverse order to get BE
			dataView.setUint8(offset, bytes[i])
		}
		if (bytes.length) dataView.setInt8(0, bytes[bytes.length - 1]) //highest byte is signed so it must be treated separately
		buffer
			.addAll(flexInt.makeValueBuffer(bytes.length))
			.addAll(byteBuffer)
	}
}