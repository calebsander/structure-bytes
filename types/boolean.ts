import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import AbsoluteType from './absolute'

/**
 * A type storing a `Boolean` value (1 bit)
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanType
 * ````
 */
export default class BooleanType extends AbsoluteType<boolean> {
	static get _value() {
		return 0x30
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, true)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: boolean) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Boolean)
		buffer.add(value ? 0xFF : 0x00) //all bits are set for good measure
	}
}