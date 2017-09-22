import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import {NOT_LONG_ENOUGH, ReadResult} from '../lib/read-util'
import strToNum from '../lib/str-to-num'
import IntegerType from './integer'

/**
 * A type storing a 2-byte signed integer (`-32768` to `32767`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.ShortType
 * ````
 */
export default class ShortType extends IntegerType<number | string, number> {
	static get _value() {
		return 0x02
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, -12345) //or '-12345'
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: number | string) {
		this.isBuffer(buffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(-32768, value as number, 32768, 'Value out of range')
		const byteBuffer = new ArrayBuffer(2)
		new DataView(byteBuffer).setInt16(0, value as number)
		buffer.addAll(byteBuffer)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<number> {
		const length = 2
		assert(buffer.byteLength >= offset + length, NOT_LONG_ENOUGH)
		return {
			value: new DataView(buffer).getInt16(offset),
			length
		}
	}
}