import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import strToNum from '../lib/str-to-num'
import UnsignedType from './unsigned'

/**
 * A type storing a 4-byte unsigned integer (`0` to `4294967295`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedIntType
 * ````
 */
export default class UnsignedIntType extends UnsignedType<number | string> {
	static get _value() {
		return 0x13
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 1234567890) //or '1234567890'
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
		assert.between(0, value as number, 0x100000000, 'Value out of range')
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setUint32(0, value as number)
		buffer.addAll(byteBuffer)
	}
}