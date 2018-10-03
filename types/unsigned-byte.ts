import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import {readNumber, ReadResult} from '../lib/read-util'
import strToNum from '../lib/str-to-num'
import UnsignedType from './unsigned'

const readByte = readNumber({type: Uint8Array, func: 'getUint8'})

/**
 * A type storing a 1-byte unsigned integer (`0` to `255`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedByteType
 * ````
 */
export class UnsignedByteType extends UnsignedType<number | string, number> {
	static get _value() {
		return 0x11
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 123) //or '123'
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
		assert.between(0, value as number, 0x100, 'Value out of range')
		buffer.add(value as number)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<number> {
		return readByte(buffer, offset)
	}
}