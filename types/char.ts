import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import GrowableBuffer from '../lib/growable-buffer'
import AbsoluteType from './absolute'

/**
 * A type storing a single unicode character
 *
 * Example:
 * ````javascript
 * let type = new sb.CharType
 * ````
 */
export default class CharType extends AbsoluteType<string> {
	static get _value() {
		return 0x40
	}
	/**
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 'é') //takes up 2 bytes in UTF-8
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: string) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		assert(value.length === 1, 'String must contain only 1 character')
		buffer.addAll(bufferString.fromString(value))
	}
}