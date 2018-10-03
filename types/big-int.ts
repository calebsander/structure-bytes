import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {NOT_LONG_ENOUGH, readFlexInt, ReadResult} from '../lib/read-util'
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
export class BigIntType extends IntegerType<string, string> {
	static get _value() {
		return 0x05
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
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
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: string) {
		this.isBuffer(buffer)
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
		const byteBuffer = new Uint8Array(bytes.length)
		for (let i = bytes.length - 1, offset = 0; i >= 0; i--, offset++) { //write in reverse order to get BE
			byteBuffer[offset] = bytes[i] //signed highest byte can be cast to unsigned byte without issue
		}
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
		let value: string
		if (bytes) {
			value = `${new Int8Array(castBuffer)[0]}`
			for (let byte = 1; byte < bytes; byte++) {
				value = strint.add(
					strint.mul(value, strint.BYTE_SHIFT),
					`${castBuffer[byte]}`
				)
			}
		}
		else value = '0'
		length += bytes
		return {value, length}
	}
}