import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {readNumber, ReadResult} from '../lib/read-util'
import strToNum from '../lib/str-to-num'
import UnsignedType from './unsigned'

const readShort = readNumber({type: Uint16Array, func: 'getUint16'})

/**
 * A type storing a 2-byte unsigned integer (`0` to `65535`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedShortType
 * ````
 */
export class UnsignedShortType extends UnsignedType<number | string, number> {
	static get _value(): number {
		return 0x12
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 12345) //or '12345'
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: number | string): void {
		this.isBuffer(buffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(0, value, 0x10000, 'Value out of range')
		const byteBuffer = new ArrayBuffer(2)
		new DataView(byteBuffer).setUint16(0, value)
		buffer.addAll(byteBuffer)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<number> {
		return readShort(buffer, offset)
	}
}