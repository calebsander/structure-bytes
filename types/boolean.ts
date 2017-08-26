import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
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
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, true)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: boolean) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Boolean)
		if (value) buffer.add(0xFF) //all bits are set for good measure
		else buffer.add(0x00)
	}
}