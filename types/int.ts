import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {readNumber, ReadResult} from '../lib/read-util'
import strToNum from '../lib/str-to-num'
import IntegerType from './integer'

const readInt = readNumber({type: Int32Array, func: 'getInt32'})

/**
 * A type storing a 2-byte signed integer (`-2147483648` to `2147483647`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.IntType
 * ````
 */
export class IntType extends IntegerType<number | string, number> {
	static get _value(): number {
		return 0x03
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, -1234567890) //or '-1234567890'
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
		assert.between(-2147483648, value, 2147483648, 'Value out of range')
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setInt32(0, value)
		buffer.addAll(byteBuffer)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<number> {
		return readInt(buffer, offset)
	}
}