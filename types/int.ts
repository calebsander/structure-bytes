import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import strToNum from '../lib/str-to-num'
import IntegerType from './integer'

/**
 * A type storing a 2-byte signed integer (`-2147483648` to `2147483647`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.IntType
 * ````
 */
export default class IntType extends IntegerType<number | string> {
	static get _value() {
		return 0x03
	}
	/**
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, -1234567890) //or '-1234567890'
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
		assert.between(-2147483648, value as number, 2147483648, 'Value out of range')
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setInt32(0, value as number)
		buffer.addAll(byteBuffer)
	}
}