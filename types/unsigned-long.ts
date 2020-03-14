import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {NOT_LONG_ENOUGH, ReadResult} from '../lib/read-util'
import * as strint from '../lib/strint'
import UnsignedType from './unsigned'

const UNSIGNED_LONG_MAX = '18446744073709551615'
/**
 * A type storing an 8-byte unsigned integer
 * (`0` to `18446744073709551615`).
 * Values to write must be given in base-10 string form.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedLongType
 * ````
 */
export class UnsignedLongType extends UnsignedType<string, string> {
	static get _value() {
		return 0x14
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, '1234567890123456789')
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: string) {
		this.isBuffer(buffer)
		assert.instanceOf(value, String)
		if (strint.gt(value, UNSIGNED_LONG_MAX) || strint.lt(value, '0')) throw new RangeError('Value out of range')
		const upper = strint.div(value, strint.LONG_UPPER_SHIFT) //get upper unsigned int
		const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)) //get lower unsigned int
		const byteBuffer = new ArrayBuffer(8)
		const dataView = new DataView(byteBuffer)
		dataView.setUint32(0, Number(upper))
		dataView.setUint32(4, Number(lower))
		buffer.addAll(byteBuffer)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<string> {
		const length = 8
		if (buffer.byteLength < offset + length) throw new Error(NOT_LONG_ENOUGH)
		const dataView = new DataView(buffer, offset)
		const upper = dataView.getUint32(0)
		const lower = dataView.getUint32(4)
		return {
			value: strint.add(strint.mul(`${upper}`, strint.LONG_UPPER_SHIFT), `${lower}`),
			length
		}
	}
}