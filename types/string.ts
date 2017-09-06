import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import AbsoluteType from './absolute'

/**
 * A type storing a string of UTF-8 characters, with no bound on length.
 * Behavior is undefined if string contains `\0` characters,
 * and no errors will be thrown when writing an invalid string.
 *
 * Example:
 * ````javascript
 * let type = new sb.StringType
 * ````
 */
export default class StringType extends AbsoluteType<string> {
	static get _value() {
		return 0x41
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 'abcdéf')
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: string) {
		this.isBuffer(buffer)
		assert.instanceOf(value, String)
		buffer
			.addAll(bufferString.fromString(value))
			.add(0) //add a null byte to indicate end
	}
}