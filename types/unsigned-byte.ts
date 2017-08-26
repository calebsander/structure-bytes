import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import strToNum from '../lib/str-to-num'
import UnsignedType from './unsigned'

/**
 * A type storing a 1-byte unsigned integer (`0` to `255`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedByteType
 * ````
 */
export default class UnsignedByteType extends UnsignedType<number | string> {
	static get _value() {
		return 0x11
	}
	/**
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 123) //or '123'
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: number | string) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(0, value as number, 0x100, 'Value out of range')
		const byteBuffer = new ArrayBuffer(1)
		new Uint8Array(byteBuffer)[0] = value as number
		buffer.addAll(byteBuffer)
	}
}