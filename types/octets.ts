import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
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
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * let octets = new Uint8Array([1, 2, 3, 4, 5])
	 * type.writeValue(buffer, octets.buffer)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: ArrayBuffer) {
		this.isBuffer(buffer)
		assert.instanceOf(value, ArrayBuffer)
		buffer
			.addAll(flexInt.makeValueBuffer(value.byteLength))
			.addAll(value)
	}
}