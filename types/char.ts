import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
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
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 'é') //takes up 2 bytes in UTF-8
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: string) {
		this.isBuffer(buffer)
		assert.instanceOf(value, String)
		assert(value.length === 1, 'String must contain only 1 character')
		buffer.addAll(bufferString.fromString(value))
	}
}