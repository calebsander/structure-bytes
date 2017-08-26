import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import GrowableBuffer from '../lib/growable-buffer'
import AbsoluteType from './absolute'

/**
 * A type storing a variable-length array of bytes.
 * This is intended for data that
 * doesn't fit any other category,
 * e.g. the contents of a PNG file.
 *
 * Example:
 * ````javascript
 * let type = new sb.OctetsType
 * ````
 */
export default class OctetsType extends AbsoluteType<ArrayBuffer> {
	static get _value() {
		return 0x42
	}
	/**
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * let octets = new Uint8Array([1, 2, 3, 4, 5])
	 * type.writeValue(buffer, octets.buffer)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: ArrayBuffer) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, ArrayBuffer)
		buffer.addAll(flexInt.makeValueBuffer(value.byteLength))
		buffer.addAll(value)
	}
}