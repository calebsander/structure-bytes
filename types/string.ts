import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import GrowableBuffer from '../lib/growable-buffer'
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
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 'abcdéf')
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: string) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		const valueBuffer = bufferString.fromString(value)
		buffer.addAll(valueBuffer)
		buffer.add(0) //add a null byte to indicate end
	}
}